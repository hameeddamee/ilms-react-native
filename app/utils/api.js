const BASE_URL = 'http://lms.nthu.edu.tw';

function toQueryString(data) {
  if (!data) {
    return '';
  }
  return Object.keys(data).map((key) => (
    `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
  )).join('&');
}

function get(path, qs) {
  return fetch(`${BASE_URL}${path}?${toQueryString(qs)}`)
  .then((res) => res.text());
}

function post(path, data) {
  const formData = new FormData();
  formData.append('QQ', 'QQ');
  if (data) {
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
  }
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    // headers: {
    //   'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    // },
    // body: toQueryString(data),
    body: formData,
  })
    .then((res) => {
      console.log(res.headers);
      return res.text();
    });
}

function postMultipart(path, data) {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data;',
      Referer: 'http://lms.nthu.edu.tw/post_insert.php?courseID=19025&action=post',
    },
    body: formData,
  })
  .then((res) => res.text());
}

export default { get, post, postMultipart };

