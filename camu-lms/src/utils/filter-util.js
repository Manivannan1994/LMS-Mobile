/**
 * @param {String} searchKeyword user typed keywords
 * @param {Array} sourceArray array of Obj where filter to be done
 * @param {Array} objectKeysInArray keys where filter to be done. Ex: ['SubjNm', 'StaffNm']
 * @param {Object} searchKeys keys where filter to be done in array of object. Ex: ['SubjNm', 'StaffNm']
 */
export const filterArray = (searchKeyword, sourceArray, objectKeysInArray, searchKeys) => {
  let filterArray = [];

  if (sourceArray?.length && objectKeysInArray?.length) {
    filterArray = sourceArray.filter((eachObj) => {
      let searchContent = "";

      objectKeysInArray.forEach((eachKey) => {
        const keyValue = eachObj[eachKey];

        if (Array.isArray(keyValue)) {
          keyValue.forEach((innerObj) => {
            const searchKey = searchKeys[eachKey];
            if (innerObj?.[searchKey]) {
              searchContent += innerObj[searchKey] ? `${innerObj[searchKey]}` : "";
            }
          });
        } else {
          searchContent += keyValue ? `${keyValue}` : "";
        }
      });

      searchContent = searchContent.toLowerCase().replace(/\s/g, "");

      return searchContent.includes(searchKeyword?.toLowerCase().replace(/\s/g, ""));
    });

    return filterArray;
  } else {
    return [];
  }
};
