/**
 *
 * This file is heavily based on MonoGame's implementation of their LzxDecoder attributed to Ali Scissons
 * which is derived from libmspack by Stuart Cole.
 *
 * (C) 2003-2004 Stuart Caie.
 * (C) 2011 Ali Scissons.
 * (C) 2017 James Stine.
 *
 * The LZX method was created by Johnathan Forbes and Tomi Poutanen, adapted by Microsoft Corporation.
 *
 */

/**
 * GNU LESSER GENERAL PUBLIC LICENSE version 2.1
 * LzxDecoder is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License (LGPL) version 2.1 
 */

/**
 * MICROSOFT PUBLIC LICENSE
 * This source code a derivative on LzxDecoder and is subject to the terms of the Microsoft Public License (Ms-PL). 
 *  
 * Redistribution and use in source and binary forms, with or without modification, 
 * is permitted provided that redistributions of the source code retain the above 
 * copyright notices and this file header. 
 *  
 * Additional copyright notices should be appended to the list above. 
 * 
 * For details, see <http://www.opensource.org/licenses/ms-pl.html>.
 *
 */

/**
 * I made the mistake of not including this license years ago. Big thanks to everyone involved and license has now been
 * acknowleded properly as it should have been back in 2017.
 *
 * Resources:
 *
 * cabextract/libmspack - http://http://www.cabextract.org.uk/
 * MonoGame LzxDecoder.cs - https://github.com/MonoGame/MonoGame/blob/master/MonoGame.Framework/Content/LzxDecoder.cs
 *
 */

import log from "./log.ts";
import { LzxBitReader } from "./binary.ts";
import XnbError from "./error.ts";

// LZX Constants
const MIN_MATCH = 2; // smallest allowable match length
const MAX_MATCH = 257; // largest allowable match length
const NUM_CHARS = 256; // number of uncompressed character types
const BLOCKTYPE = {
  INVALID: 0,
  VERBATIM: 1,
  ALIGNED: 2,
  UNCOMPRESSED: 3,
};
const PRETREE_NUM_ELEMENTS = 20;
const ALIGNED_NUM_ELEMENTS = 8; // aligned offset tree elements
const NUM_PRIMARY_LENGTHS = 7;
const NUM_SECONDARY_LENGTHS = 249; // number of elements in length tree

// LZX Huffman Constants
const PRETREE_MAXSYMBOLS = PRETREE_NUM_ELEMENTS;
const PRETREE_TABLEBITS = 6;
const MAINTREE_MAXSYMBOLS = NUM_CHARS + 50 * 8;
const MAINTREE_TABLEBITS = 12;
const LENGTH_MAXSYMBOLS = NUM_SECONDARY_LENGTHS + 1;
const LENGTH_TABLEBITS = 12;
const ALIGNED_MAXSYMBOLS = ALIGNED_NUM_ELEMENTS;
const ALIGNED_TABLEBITS = 7;
const LENTABLE_SAFETY = 64; // table decoding overruns are allowed

/**
 * LZX Static Data Tables
 *
 * LZX uses 'position slots' to represent match offsets.  For every match,
 * a small 'position slot' number and a small offset from that slot are
 * encoded instead of one large offset.
 *
 * position_base[] is an index to the position slot bases
 *
 * extra_bits[] states how many bits of offset-from-base data is needed.
 */
const positionBase: number[] = [];
const extraBits: number[] = [];

/**
 * Used to compress and decompress LZX format buffer.
 * @class
 * @public
 */
class Lzx {
  window_size: number;
  R0: number;
  R1: number;
  R2: number;
  main_elements: number;
  header_read: boolean;
  block_remaining: number;
  block_type: number;
  window_posn: number;
  pretree_table: number[];
  pretree_len: number[];
  aligned_table: number[];
  aligned_len: number[];
  length_table: number[];
  length_len: number[];
  maintree_table: number[];
  maintree_len: number[];
  win: number[];

  /** Creates an instance of LZX with a given window frame. */
  constructor(windowBits: number) {
    // get the window size from window bits
    this.window_size = 1 << windowBits;

    // LZX supports window sizes of 2^15 (32 KB) to 2^21 (2 MB)
    if (windowBits < 15 || windowBits > 21) {
      throw new XnbError("Window size out of range!");
    }

    // initialize static tables
    if (!extraBits.length) {
      for (let i = 0, j = 0; i <= 50; i += 2) {
        extraBits[i] = extraBits[i + 1] = j;
        if (i != 0 && j < 17) {
          j++;
        }
      }
    }
    if (!positionBase.length) {
      for (let i = 0, j = 0; i <= 50; i++) {
        positionBase[i] = j;
        j += 1 << extraBits[i];
      }
    }

    log.debug(`Extra Bits:`);
    log.debug(JSON.stringify(extraBits));
    log.debug(`Position Base:`);
    log.debug(JSON.stringify(positionBase));

    /**
     * calculate required position slots
     *
     * window bits:     15 16 17 18 19 20 21
     * position slots:  30 32 34 36 38 42 50
     */
    const posnSlots =
      (windowBits == 21 ? 50 : (windowBits == 20 ? 42 : windowBits << 1));

    // repeated offsets
    this.R0 = this.R1 = this.R2 = 1;
    // set the number of main elements
    this.main_elements = NUM_CHARS + (posnSlots << 3);
    // state of header being read used for when looping over multiple blocks
    this.header_read = false;
    // set the block remaining
    this.block_remaining = 0;
    // set the default block type
    this.block_type = BLOCKTYPE.INVALID;
    // window position
    this.window_posn = 0;

    // frequently used tables
    this.pretree_table = [];
    this.pretree_len = [];
    this.aligned_table = [];
    this.aligned_len = [];
    this.length_table = [];
    this.length_len = [];
    this.maintree_table = [];
    this.maintree_len = [];

    // initialize main tree and length tree for use with delta operations
    for (let i = 0; i < MAINTREE_MAXSYMBOLS; i++) {
      this.maintree_len[i] = 0;
    }
    for (let i = 0; i < NUM_SECONDARY_LENGTHS; i++) {
      this.length_len[i] = 0;
    }

    // the decompression window
    this.win = [];
  }

  /** Decompress the buffer with given frame and block size. */
  decompress(
    buffer: LzxBitReader,
    frameSize: number,
    blockSize: number,
  ): number[] {
    // read header if we haven't already
    if (!this.header_read) {
      // read the intel call
      const intel = buffer.readLZXBits(1);

      log.debug(`Intel: ${log.b(intel, 1)} = ${intel}`);

      // don't care about intel e8
      if (intel != 0) {
        throw new XnbError(`Intel E8 Call found, invalid for XNB files.`);
      }

      // the header has been read
      this.header_read = true;
    }

    // set what's left to go to the frame size
    let togo = frameSize;

    // loop over what's left of the frame
    while (togo > 0) {
      // this is a new block
      if (this.block_remaining == 0) {
        // read in the block type
        this.block_type = buffer.readLZXBits(3);

        log.debug(
          `Blocktype: ${log.b(this.block_type, 3)} = ${this.block_type}`,
        );

        // read 24-bit value for uncompressed bytes in this block
        const hi = buffer.readLZXBits(16);
        const lo = buffer.readLZXBits(8);
        // number of uncompressed bytes for this block left
        this.block_remaining = (hi << 8) | lo;

        log.debug(`Block Remaining: ${this.block_remaining}`);

        // switch over the valid block types
        switch (this.block_type) {
          // deno-lint-ignore no-fallthrough
          case BLOCKTYPE.ALIGNED:
            // aligned offset tree
            for (let i = 0; i < 8; i++) {
              this.aligned_len[i] = buffer.readLZXBits(3);
            }
            // decode table for aligned tree
            this.aligned_table = this.decodeTable(
              ALIGNED_MAXSYMBOLS,
              ALIGNED_TABLEBITS,
              this.aligned_len,
            );
            // NOTE: rest of aligned block type is the same as verbatim block type
          case BLOCKTYPE.VERBATIM:
            // read the first 256 elements for main tree
            this.readLengths(buffer, this.maintree_len, 0, 256);
            // read the rest of the elements for the main tree
            this.readLengths(
              buffer,
              this.maintree_len,
              256,
              this.main_elements,
            );
            // decode the main tree into a table
            this.maintree_table = this.decodeTable(
              MAINTREE_MAXSYMBOLS,
              MAINTREE_TABLEBITS,
              this.maintree_len,
            );
            // read path lengths for the length tree
            this.readLengths(buffer, this.length_len, 0, NUM_SECONDARY_LENGTHS);
            // decode the length tree
            this.length_table = this.decodeTable(
              LENGTH_MAXSYMBOLS,
              LENGTH_TABLEBITS,
              this.length_len,
            );
            break;
          case BLOCKTYPE.UNCOMPRESSED:
            // align the bit buffer to byte range
            buffer.align();
            // read the offsets
            this.R0 = buffer.readInt32(true);
            this.R1 = buffer.readInt32(true);
            this.R2 = buffer.readInt32(true);
            break;
          default:
            throw new XnbError(`Invalid Blocktype Found: ${this.block_type}`);
        }
      }

      // iterate over the block remaining
      let thisRun = this.block_remaining;

      // loop over the bytes left in the buffer to run out our output
      while ((thisRun = this.block_remaining) > 0 && togo > 0) {
        // if this run is somehow higher than togo then just cap it
        if (thisRun > togo) {
          thisRun = togo;
        }

        // reduce togo and block remaining by this iteration
        togo -= thisRun;
        this.block_remaining -= thisRun;

        // apply 2^x-1 mask
        this.window_posn &= this.window_size - 1;
        // run cannot exceed frame size
        if (this.window_posn + thisRun > this.window_size) {
          throw new XnbError("Cannot run outside of window frame.");
        }

        switch (this.block_type) {
          case BLOCKTYPE.ALIGNED:
            while (thisRun > 0) {
              // get the element of this run
              let mainElement = this.readHuffSymbol(
                buffer,
                this.maintree_table,
                this.maintree_len,
                MAINTREE_MAXSYMBOLS,
                MAINTREE_TABLEBITS,
              );

              // main element is an unmatched character
              if (mainElement < NUM_CHARS) {
                this.win[this.window_posn++] = mainElement;
                thisRun--;
                continue;
              }

              mainElement -= NUM_CHARS;

              let lengthFooter;

              let matchLength = mainElement & NUM_PRIMARY_LENGTHS;
              if (matchLength == NUM_PRIMARY_LENGTHS) {
                // get the length footer
                lengthFooter = this.readHuffSymbol(
                  buffer,
                  this.length_table,
                  this.length_len,
                  LENGTH_MAXSYMBOLS,
                  LENGTH_TABLEBITS,
                );
                // increase match length by the footer
                matchLength += lengthFooter;
              }
              matchLength += MIN_MATCH;

              let matchOffset = mainElement >> 3;

              if (matchOffset > 2) {
                // not repeated offset
                let extra = extraBits[matchOffset];
                matchOffset = positionBase[matchOffset] - 2;
                if (extra > 3) {
                  // verbatim and aligned bits
                  extra -= 3;
                  const verbatimBits = buffer.readLZXBits(extra);
                  matchOffset += verbatimBits << 3;
                  const alignedBits = this.readHuffSymbol(
                    buffer,
                    this.aligned_table,
                    this.aligned_len,
                    ALIGNED_MAXSYMBOLS,
                    ALIGNED_TABLEBITS,
                  );
                  matchOffset += alignedBits;
                } else if (extra == 3) {
                  // aligned bits only
                  matchOffset += this.readHuffSymbol(
                    buffer,
                    this.aligned_table,
                    this.aligned_len,
                    ALIGNED_MAXSYMBOLS,
                    ALIGNED_TABLEBITS,
                  );
                } else if (extra > 0) {
                  // verbatim bits only
                  matchOffset += buffer.readLZXBits(extra);
                } else {
                  matchOffset = 1; // ???
                }

                // update repeated offset LRU queue
                this.R2 = this.R1;
                this.R1 = this.R0;
                this.R0 = matchOffset;
              } else if (matchOffset === 0) {
                matchOffset = this.R0;
              } else if (matchOffset == 1) {
                matchOffset = this.R1;
                this.R1 = this.R0;
                this.R0 = matchOffset;
              } else {
                matchOffset = this.R2;
                this.R2 = this.R0;
                this.R0 = matchOffset;
              }

              let rundest = this.window_posn;
              let runsrc;
              thisRun -= matchLength;

              // copy any wrapped around source data
              if (this.window_posn >= matchOffset) {
                runsrc = rundest - matchOffset; // no wrap
              } else {
                runsrc = rundest + (this.window_size - matchOffset);
                let copyLength = matchOffset - this.window_posn;
                if (copyLength < matchLength) {
                  matchLength -= copyLength;
                  this.window_posn += copyLength;
                  while (copyLength-- > 0) {
                    this.win[rundest++] = this.win[runsrc++];
                  }
                  runsrc = 0;
                }
              }
              this.window_posn += matchLength;

              // copy match data - no worrries about destination wraps
              while (matchLength-- > 0) {
                this.win[rundest++] = this.win[runsrc++];
              }
            }
            break;

          case BLOCKTYPE.VERBATIM:
            while (thisRun > 0) {
              // get the element of this run
              let mainElement = this.readHuffSymbol(
                buffer,
                this.maintree_table,
                this.maintree_len,
                MAINTREE_MAXSYMBOLS,
                MAINTREE_TABLEBITS,
              );

              // main element is an unmatched character
              if (mainElement < NUM_CHARS) {
                this.win[this.window_posn++] = mainElement;
                thisRun--;
                continue;
              }

              // match: NUM_CHARS + ((slot << 3) | length_header (3 bits))

              mainElement -= NUM_CHARS;

              let lengthFooter;

              let matchLength = mainElement & NUM_PRIMARY_LENGTHS;
              if (matchLength == NUM_PRIMARY_LENGTHS) {
                // read the length footer
                lengthFooter = this.readHuffSymbol(
                  buffer,
                  this.length_table,
                  this.length_len,
                  LENGTH_MAXSYMBOLS,
                  LENGTH_TABLEBITS,
                );
                matchLength += lengthFooter;
              }
              matchLength += MIN_MATCH;

              let matchOffset = mainElement >> 3;

              if (matchOffset > 2) {
                // not repeated offset
                if (matchOffset != 3) {
                  const extra = extraBits[matchOffset];
                  const verbatimBits = buffer.readLZXBits(extra);
                  matchOffset = positionBase[matchOffset] - 2 +
                    verbatimBits;
                } else {
                  matchOffset = 1;
                }

                // update repeated offset LRU queue
                this.R2 = this.R1;
                this.R1 = this.R0;
                this.R0 = matchOffset;
              } else if (matchOffset === 0) {
                matchOffset = this.R0;
              } else if (matchOffset == 1) {
                matchOffset = this.R1;
                this.R1 = this.R0;
                this.R0 = matchOffset;
              } else {
                matchOffset = this.R2;
                this.R2 = this.R0;
                this.R0 = matchOffset;
              }

              let rundest = this.window_posn;
              let runsrc;
              thisRun -= matchLength;

              // copy any wrapped around source data
              if (this.window_posn >= matchOffset) {
                runsrc = rundest - matchOffset; // no wrap
              } else {
                runsrc = rundest + (this.window_size - matchOffset);
                let copyLength = matchOffset - this.window_posn;
                if (copyLength < matchLength) {
                  matchLength -= copyLength;
                  this.window_posn += copyLength;
                  while (copyLength-- > 0) {
                    this.win[rundest++] = this.win[runsrc++];
                  }
                  runsrc = 0;
                }
              }
              this.window_posn += matchLength;

              // copy match data - no worrries about destination wraps
              while (matchLength-- > 0) {
                this.win[rundest++] = this.win[runsrc++];
              }
            }
            break;

          case BLOCKTYPE.UNCOMPRESSED:
            if ((buffer.bytePosition + thisRun) > blockSize) {
              throw new XnbError(
                "Overrun!" + blockSize + " " + buffer.bytePosition + " " +
                  thisRun,
              );
            }
            for (let i = 0; i < thisRun; i++) {
              this.win[this.window_posn + i] =
                buffer.buffer[buffer.bytePosition + i];
            }
            buffer.bytePosition += thisRun;
            this.window_posn += thisRun;
            break;

          default:
            throw new XnbError("Invalid blocktype specified!");
        }
      }
    }

    // there is still more left
    if (togo != 0) {
      throw new XnbError("EOF reached with data left to go.");
    }

    // ensure the buffer is aligned
    buffer.align();

    // get the start window position
    const startWindowPos =
      ((this.window_posn == 0) ? this.window_size : this.window_posn) -
      frameSize;

    // return the window
    return this.win.slice(startWindowPos, startWindowPos + frameSize);
  }

  /**
   * Reads in code lengths for symbols first to last in the given table
   * The code lengths are stored in their own special LZX way. 
   */
  readLengths(
    buffer: LzxBitReader,
    table: number[],
    first: number,
    last: number,
  ): number[] {
    // read in the 4-bit pre-tree deltas
    for (let i = 0; i < 20; i++) {
      this.pretree_len[i] = buffer.readLZXBits(4);
    }

    // create pre-tree table from lengths
    this.pretree_table = this.decodeTable(
      PRETREE_MAXSYMBOLS,
      PRETREE_TABLEBITS,
      this.pretree_len,
    );

    // loop through the lengths from first to last
    for (let i = first; i < last;) {
      // read in the huffman symbol
      let symbol = this.readHuffSymbol(
        buffer,
        this.pretree_table,
        this.pretree_len,
        PRETREE_MAXSYMBOLS,
        PRETREE_TABLEBITS,
      );

      // code = 17, run of ([read 4 bits] + 4) zeros
      if (symbol == 17) {
        // read in number of zeros as a 4-bit number + 4
        let zeros = buffer.readLZXBits(4) + 4;
        // iterate over zeros counter and add them to the table
        while (zeros-- != 0) {
          table[i++] = 0;
        }
      } // code = 18, run of ([read 5 bits] + 20) zeros
      else if (symbol == 18) {
        // read in number of zeros as a 5-bit number + 20
        let zeros = buffer.readLZXBits(5) + 20;
        // add the number of zeros into the table array
        while (zeros-- != 0) {
          table[i++] = 0;
        }
      } // code = 19 run of ([read 1 bit] + 4) [read huffman symbol]
      else if (symbol == 19) {
        // read for how many of the same huffman symbol to repeat
        let same = buffer.readLZXBits(1) + 4;
        // read another huffman symbol
        symbol = this.readHuffSymbol(
          buffer,
          this.pretree_table,
          this.pretree_len,
          PRETREE_MAXSYMBOLS,
          PRETREE_TABLEBITS,
        );
        symbol = table[i] - symbol;
        if (symbol < 0) symbol += 17;
        while (same-- != 0) {
          table[i++] = symbol;
        }
      } // code 0 -> 16, delta current length entry
      else {
        symbol = table[i] - symbol;
        if (symbol < 0) symbol += 17;
        table[i++] = symbol;
      }
    }

    // return the table created
    return table;
  }

  /**
     * Build a decode table from a canonical huffman lengths table
     * @public
     * @method makeDecodeTable
     * @param symbols Total number of symbols in tree.
     * @param bits Any symbols less than this can be decoded in one lookup of table.
     * @param length Table for lengths of given table to decode.
     * @returns Decoded table, length should be ((1<<nbits) + (nsyms*2))
     */
  decodeTable(symbols: number, bits: number, length: number[]): number[] {
    // decoded table to act on and return
    const table = [];

    let pos = 0;
    let tableMask = 1 << bits;
    let bitMask = tableMask >> 1;

    // loop across all bit positions
    for (let bitNum = 1; bitNum <= bits; bitNum++) {
      // loop over the symbols we're decoding
      for (let symbol = 0; symbol < symbols; symbol++) {
        // if the symbol isn't in this iteration of length then just ignore
        if (length[symbol] == bitNum) {
          let leaf = pos;
          // if the position has gone past the table mask then we're overrun
          if ((pos += bitMask) > tableMask) {
            log.debug(length[symbol].toString());
            log.debug(
              `pos: ${pos}, bit_mask: ${bitMask}, table_mask: ${tableMask}`,
            );
            log.debug(`bit_num: ${bitNum}, bits: ${bits}`);
            log.debug(`symbol: ${symbol}, symbols: ${symbols}`);
            throw new XnbError("Overrun table!");
          }
          // fill all possible lookups of this symbol with the symbol itself
          let fill = bitMask;
          while (fill-- > 0) {
            table[leaf++] = symbol;
          }
        }
      }
      // advance bit mask down the bit positions
      bitMask >>= 1;
    }

    // exit with success if table is complete
    if (pos == tableMask) {
      return table;
    }

    // mark all remaining table entries as unused
    for (let symbol = pos; symbol < tableMask; symbol++) {
      table[symbol] = 0xFFFF;
    }

    // next_symbol = base of allocation for long codes
    let nextSymbol = ((tableMask >> 1) < symbols) ? symbols : (tableMask >> 1);

    // allocate space for 16-bit values
    pos <<= 16;
    tableMask <<= 16;
    bitMask = 1 << 15;

    // loop again over the bits
    for (let bitNum = bits + 1; bitNum <= 16; bitNum++) {
      // loop over the symbol range
      for (let symbol = 0; symbol < symbols; symbol++) {
        // if the current length iteration doesn't mach our bit then just ignore
        if (length[symbol] != bitNum) {
          continue;
        }

        // get leaf shifted away from 16 bit padding
        let leaf = pos >> 16;

        // loop over fill to flood table with
        for (let fill = 0; fill < (bitNum - bits); fill++) {
          // if this path hasn't been taken yet, 'allocate' two entries
          if (table[leaf] == 0xFFFF) {
            table[(nextSymbol << 1)] = 0xFFFF;
            table[(nextSymbol << 1) + 1] = 0xFFFF;
            table[leaf] = nextSymbol++;
          }

          // follow the path and select either left or right for the next bit
          leaf = table[leaf] << 1;
          if ((pos >> (15 - fill)) & 1) {
            leaf++;
          }
        }
        table[leaf] = symbol;

        // bit position has overun the table mask
        if ((pos += bitMask) > tableMask) {
          throw new XnbError("Overrun table during decoding.");
        }
      }
      bitMask >>= 1;
    }

    // we have reached table mask
    if (pos == tableMask) {
      return table;
    }

    // something else went wrong
    throw new XnbError("Decode table did not reach table mask.");
  }

  /**
     * Decodes the next huffman symbol from the bitstream.
     * @public
     * @method readHuffSymbol
     * @param buffer
     * @param table
     * @param length
     * @param symbols
     * @param bits
     * @returns
     */
  readHuffSymbol(
    buffer: LzxBitReader,
    table: number[],
    length: number[],
    symbols: number,
    bits: number,
  ): number {
    // peek the specified bits ahead
    const bit = (buffer.peekLZXBits(32) >>> 0); // (>>> 0) allows us to get a 32-bit uint
    let i = table[buffer.peekLZXBits(bits)];

    // if our table is accessing a symbol beyond our range
    if (i >= symbols) {
      let j = 1 << (32 - bits);
      do {
        j >>= 1;
        i <<= 1;
        i |= (bit & j) != 0 ? 1 : 0;
        if (j == 0) {
          return 0;
        }
      } while ((i = table[i]) >= symbols);
    }

    // seek past this many bits
    buffer.bitOffset += length[i];

    // return the symbol
    return i;
  }

  /**
     * Sets the shortest match.
     * @param X
     */
  set RRR(X: number) {
    // No match, R2 <- R1, R1 <- R0, R0 <- X
    if (this.R0 != X && this.R1 != X && this.R2 != X) {
      // shift all offsets down
      this.R2 = this.R1;
      this.R1 = this.R0;
      this.R0 = X;
    } // X = R1, Swap R0 <-> R1
    else if (this.R1 == X) {
      const R1 = this.R1;
      this.R1 = this.R0;
      this.R0 = R1;
    } // X = R2, Swap R0 <-> R2
    else if (this.R2 == X) {
      const R2 = this.R2;
      this.R2 = this.R0;
      this.R0 = R2;
    }
  }
}

export default Lzx;
