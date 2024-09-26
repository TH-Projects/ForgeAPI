module.exports = async function (fastify) {
    fastify.register(require('./REST/employees/getAllEmployees'));
    fastify.register(require('./REST/employees/getEmployeesByName'));
    fastify.register(require('./REST/employees/postEmployees'));
    fastify.register(require('./REST/employees/putEmployees'));
    fastify.register(require('./REST/employees/deleteEmployee'));
    fastify.register(require('./REST/departments/getDepartments'));
    fastify.register(require('./REST/departments/postDepartments'));
    fastify.register(require('./REST/departments/deleteDepartments'));
};
