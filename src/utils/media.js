const apiHost = (process.env.REACT_APP_API_URL || "http://localhost:4001/api/v1").replace("/api/v1", "");

function isPlainObject(o) {
  if (typeof o !== 'object' || o === null) return false;
  const proto = Object.getPrototypeOf(o);
  return proto === null || proto === Object.prototype;
}

export function transformRelativeUrls(obj) {
  if (typeof obj === "string") {
    if (obj.startsWith("/uploads/")) {
      return `${apiHost}${obj}`;
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(transformRelativeUrls);
  }
  
  if (isPlainObject(obj)) {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = transformRelativeUrls(obj[key]);
      }
    }
    return newObj;
  }
  
  return obj;
}

export function restoreRelativeUrls(obj) {
  if (typeof obj === "string") {
    if (obj.startsWith(apiHost) && obj.includes("/uploads/")) {
      return obj.substring(apiHost.length);
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(restoreRelativeUrls);
  }
  
  if (isPlainObject(obj)) {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = restoreRelativeUrls(obj[key]);
      }
    }
    return newObj;
  }
  
  return obj;
}

export const getMediaUrl = (url) => {
  if (!url) return "";
  if (typeof url !== "string") return url;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  return `${apiHost}${url.startsWith("/") ? "" : "/"}${url}`;
};
