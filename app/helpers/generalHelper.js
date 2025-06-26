function formatQuery(query, params) {
    let i = 0;
    return query.replace(/\?/g, () => {
        const param = params[i++];
        if (typeof param === 'string') return `'${param}'`;
        return param;
    });
}

module.exports = formatQuery;