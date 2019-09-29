export default function getDataFromLocalStorage(prop) {
  if (localStorage.getItem(prop) === null) {
    return null
  }
  return JSON.parse(localStorage.getItem(prop));
}