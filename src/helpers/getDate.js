export function getDate() {
  let dateObj = new Date();
  let month = dateObj.getUTCMonth() + 1;
  let day = dateObj.getUTCDate();
  let year = dateObj.getUTCFullYear();

  let hours = dateObj.getHours();
  let minutes = dateObj.getMinutes();

  day = day < 10 ? '0' + day : day;
  month = month < 10 ? '0' + month : month;
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  return `${hours}:${minutes} ${day}.${month}.${year}`;
}