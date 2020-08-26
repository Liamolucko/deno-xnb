const Enum = (values: string[]) => {
    if (!Array.isArray(values))
        throw new Error('Invalid parameters, requires array of values.');
    if (values.length === 0)
        throw new Error('Invalid parameters, empty value set.');

    const _enum: Record<string, symbol> = {};
    for (let i = 0; i < values.length; i++) {
        try {
            new Function(`var ${values[i]}`)();
        }
        catch (ex) {
            throw new Error(`Invalid parameters, ${values[i]} is not a valid name.`);
        }
        _enum[values[i]] = Symbol();
    }

    // return a new proxy of frozen enum
    return Object.freeze(_enum);
}

export default Enum;
