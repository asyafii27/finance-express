function paginate(array, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const paginatedItems = array.slice(offset, offset + limit);
    return {
        data: paginatedItems,
        meta: {
            total: array.length,
            page,
            limit,
            totalPages: Math.ceil(array.length / limit),
        }
    };
}

module.exports = paginate;