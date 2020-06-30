import moment from 'moment-timezone';

export const parseEpochToEST = (milli: string) => moment(parseInt(milli)).tz('America/Toronto').format('MMMM Do YYYY, h:mm:ss a')
