const axios = require("axios");
const ObjectsToCsv = require("objects-to-csv");

const average = (array) => {
  const sum = array.reduce((acc, cur) => {
    return acc + cur.data;
  }, 0);
  return sum / array.length;
};

const max = (array) => {
  const arrayMap = array.map((item) => item.data);
  return Math.max(...arrayMap);
};

const min = (array) => {
  const arrayMap = array.map((item) => item.data);
  return Math.min(...arrayMap);
};

const averageSlice200 = (dataArray) => {
  const result = [];
  let start = 0; // 0 200 400
  let end = 200; // 400
  const round = Math.ceil(dataArray.length / 200);

  for (let i = 0; i < round; i++) {
    const dataSlice = dataArray.slice(start, end);
    start = 200 * (i + 1);
    end = 200 * (i + 2);
    result.push({
      round: i + 1,
      average: average(dataSlice),
      max: max(dataSlice),
      min: min(dataSlice),
      dateStart: dataSlice[0].timestamp,
      dateEnd: dataSlice[dataSlice.length - 1].timestamp,
      diffTime:
        (new Date(dataSlice[dataSlice.length - 1].timestamp).getTime() - new Date(dataSlice[0].timestamp).getTime()) /
        (1000 * 60),
      lenght: dataSlice.length,
    });
  }
  return result;
};

const averageSlice2880 = (dataArray) => {
  const result = [];
  let start = 0; // 0 200 400
  let end = 2880; // 400
  const round = Math.ceil(dataArray.length / 2880);

  for (let i = 0; i < round; i++) {
    const dataSlice = dataArray.sort((a, b) => a.id - b.id).slice(start, end);
    start = 2880 * (i + 1);
    end = 2880 * (i + 2);
    result.push({
      idStart: dataSlice[0].id,
      idEnd: dataSlice[dataSlice.length - 1].id,
      diffId: dataSlice[dataSlice.length - 1].id - dataSlice[0].id,
      round: i + 1,
      average: average(dataSlice),
      max: max(dataSlice),
      min: min(dataSlice),
      dateStart: dataSlice[0].timestamp,
      dateEnd: dataSlice[dataSlice.length - 1].timestamp,
      diffTime:
        (new Date(dataSlice[dataSlice.length - 1].timestamp).getTime() - new Date(dataSlice[0].timestamp).getTime()) /
        (1000 * 60),
      length: dataSlice.length,
    });
  }
  return result;
};

const dataSummaryGroupByDate = (dataArray) => {
  const result = [];
  const arrayDate = Array.from(new Set(dataArray.map((item) => item.timestamp.split("T")[0])));
  for (let value of arrayDate) {
    const filterDataBydate = dataArray.filter((item) => item.timestamp.split("T")[0] === value);
    result.push({
      average: average(filterDataBydate),
      max: max(filterDataBydate),
      min: min(filterDataBydate),
      date: value,
      length: filterDataBydate.length,
    });
  }
  return result;
};

const createDiffAvg = (array) => {
  const clone = [...array];
  const result = clone.map((item, index) => ({
    diffRange: `${item.date} - ${clone[index + 1].data}`,
    diff: clone[index + 1].average - item.average,
  }));
  return result;
};

const createDiffData = (array) => {
  const clone = [...array];
  const result = clone.map((item, index) => ({
    diffTimestamp: `${item.timestamp} - ${clone[index + 1].timestamp}`,
    diff: clone[index + 1].data - item.data,
  }));
  return result;
};

const createTimeDiff = (array) => {
  const result = [];
  const sort = array.sort((a, b) => a.id - b.id);
  for (let index in sort) {
    result.push({
      s: sort[index],
      t: sort[index + 1],
    });
  }
  return sort;
};

//  Filter เพื่อเอา Id ที่ซ้ำออกไป
const dataFiltered = (array) => {
  const resultId = [];
  const result = [];
  for (let data of array) {
    if (!resultId.includes(data.id)) {
      result.push(data);
      resultId.push(data.id);
    }
  }
  return result;
};

const run = async () => {
  const dataGet = await axios.get("http://3.1.189.234:8091/data/ttntest");

  //   filtered
  const dataFilter = dataFiltered(dataGet.data).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  //   Cannot filter
  //   const dataFilter = dataGet.data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const arrayGroup = averageSlice200(dataFilter);
  console.log(arrayGroup);
  //   const csv = new ObjectsToCsv(arrayGroup);
  //   await csv.toDisk("./export200.csv");
  //   console.log(createDiffAvg(arrayGroup));
  //   console.log(dataFilter);
  //   console.log(dataSummaryGroupByDate(dataFilter));
};

run();
