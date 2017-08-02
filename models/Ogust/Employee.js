const Ogust = require('../../config/config').Ogust;
const rp = require('request-promise');

const { getIntervalInRange } = require('../../helpers/intervalInRange');

/*
** Get all employees
** PARAMS:
** - token: token after login
** - status: employee status (active...)
** - nature: employee nature (employee, customer...)
** Method: POST
*/
exports.getEmployees = async (token, status, nature, nbperpage, pagenum) => {
  const options = {
    url: `${Ogust.API_LINK}searchEmployee`,
    json: true,
    body: { token, status, nature, nbperpage, pagenum },
    resolveWithFullResponse: true,
    time: true,
  };
  const result = await rp.post(options);
  return result;
};

/*
** Get all employees by sector
** PARAMS:
** - token: token after login
** - sector: employee sector
** - nbpepage: X (number of results returned per pages)
** - pagenum: Y (number of pages)
** METHOD: POST
*/
exports.getEmployeesBySector = async (token, sector, status, nature, nbperpage, pagenum) => {
  const options = {
    url: `${Ogust.API_LINK}searchEmployee`,
    json: true,
    // status 'A' = 'Actif', nature 'S' = 'Salarié'
    body: { token, sector, status, nature, nbperpage, pagenum },
    resolveWithFullResponse: true,
    time: true,
  };
  const result = await rp.post(options);
  return result;
};

/*
** Get an employee by employee id
** PARAMS:
** - token: token after login
** - id: employee id
** - status: employee status
** Method: POST
*/
exports.getEmployeeById = async (token, id, status) => {
  const options = {
    url: `${Ogust.API_LINK}getEmployee`,
    json: true,
    body: { token, id_employee: id, status },
    resolveWithFullResponse: true,
    time: true,
  };
  const result = await rp.post(options);
  return result;
};

/*
** Get services by employee id in range or by date
** PARAMS:
** - token: token after login
** - id: employee id
** - isRange: true / false
** - isDate: true / false
** - slotToSub (time in number to subtract),
** - slotToAdd (time in number to add)
** - intervalType: "day", "week", "year", "hour"...
** - dateStart: YYYYMMDDHHmm format
** - dateEnd: YYYYMMDDHHmm format
** - status: '@!=|N', 'R'...
** - type: 'I'...
** - nbPerPage: X (number of results returned per pages)
** - pageNum: Y (number of pages)
** METHOD: POST
*/
exports.getServices = async (token, id, isRange, isDate, slotToSub, slotToAdd, intervalType, startDate, endDate, status, type, nbPerPage, pageNum) => {
  let interval = {};
  if (isRange == 'true') {
    interval = getIntervalInRange(slotToSub, slotToAdd, intervalType);
  }
  if (isDate == 'true') {
    interval.intervalBwd = parseInt(startDate, 10);
    interval.intervalFwd = parseInt(endDate, 10);
  }
  const options = {
    url: `${Ogust.API_LINK}searchService`,
    json: true,
    body: {
      token,
      id_employee: id,
      status,
      type, // I = Intervention
      start_date: `${'@between|'}${interval.intervalBwd}|${interval.intervalFwd}`,
      nbperpage: nbPerPage,
      pagenum: pageNum
    },
    resolveWithFullResponse: true,
    time: true
  };
  const res = await rp.post(options);
  return res;
};

/*
** Get salaries by employee id
** PARAMS:
** - token: token after login
** - id: employee id
** - nbPerPage: X (number of results returned per pages)
** - pageNum: Y (number of pages)
** METHOD: POST
*/
exports.getSalaries = async (token, id, nbperpage, pagenum) => {
  const options = {
    url: `${Ogust.API_LINK}searchSalary`,
    json: true,
    body: {
      token,
      id_employee: id,
      nbperpage,
      pagenum,
    },
    resolveWithFullResponse: true,
    time: true,
  };
  const res = await rp.post(options);
  return res;
};
