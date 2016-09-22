import { Platform } from 'react-native';
import HTMLParser from 'fast-html-parser';
import cheerio from 'cheerio-without-node-native';
import I18n from 'react-native-i18n';

function parseCourseName(name) {
  const locale = I18n.locale;
  const englishNameRegex = /[ a-zA-Z0-9().&\-]+/;
  if (name.length < 10) {
    return name;
  }
  let enlighName = name.match(englishNameRegex);
  if (!enlighName) {
    return name;
  }
  if (Array.isArray(enlighName)) {
    enlighName = enlighName.join(' ');
  }
  const chineseName = name.replace(enlighName, '');
  if (Platform.OS === 'ios') {
    return chineseName;
  }
  if (locale.startsWith('zh')) {
    return chineseName;
  }
  return enlighName;
}

function parseDate(dateStr) {
  const match = dateStr.match(/(\d+)-(\d+)-(\d+)\s+(\d+):(\d+):(\d+)/);
  return {
    year: match[1],
    month: match[2],
    day: match[3],
    hour: match[4],
    minute: match[5],
    second: match[6],
  };
}

export function parseLatestNews(html) {
  const $ = cheerio.load(html);
  const blockItems = $('#right div.BlockR').eq(1).find('.BlockItem');
  return blockItems.map((i, item) => {
    const link = $(item).find('a');
    const id = link.eq(0).attr('href').match(/.*\((\d+).\)*/)[1];
    const dateStr = `${$(item).find('.hint').attr('title')} 00:00:00`;
    return {
      id: i,
      itemId: id,
      title: parseCourseName(link.eq(1).text()),
      subtitle: link.eq(0).text(),
      date: parseDate(dateStr),
      dateStr,
      courseId: link.eq(1).attr('href').match(/.*ID=(\d+).*/)[1],
    };
  }).get();
}

export function parseProfile(html) {
  const $ = cheerio.load(html);
  const name = $('#fmName').attr('value');
  const email = $('#fmEmail').attr('value');
  return { name, email };
}

export function parseCourseList(html) {
  const $ = cheerio.load(html);
  const mnuItems = $('.mnuItem a');
  const courseUrlRegex = /^\/course\/(\d+)$/;
  return mnuItems.filter((i, item) => (
    courseUrlRegex.test($(item).attr('href'))
  ))
  .map((i, item) => ({
    id: $(item).attr('href').match(courseUrlRegex)[1],
    name: parseCourseName($(item).text()),
  })).get();
}

export function parseCourseNameTitle(html) {
  const root = HTMLParser.parse(html);
  const title = root.querySelector('title').text;
  const courseName = title.replace(' - 國立清華大學 iLMS數位學習平台', '');
  return parseCourseName(courseName);
}

function parseAnnouncementList(html) {
  const $ = cheerio.load(html);
  if ($('#main').text().indexOf('目前尚無資料') !== -1) {
    return [];
  }
  return $('#main tr').filter(i => i % 2 === 1).map((i, tr) => {
    const td = $(tr).find('td');
    const dateStr = td.eq(3).find('span').attr('title');
    return {
      id: td.eq(0).text(),
      title: td.eq(1).text(),
      date: parseDate(dateStr),
      dateStr,
    };
  }).get();
}

function parseMaterialList(html) {
  const $ = cheerio.load(html);
  if ($('#main').text().indexOf('目前尚無資料') !== -1) {
    return [];
  }
  return $('#main tr').slice(1).map((i, tr) => {
    const td = $(tr).find('td');
    const dateStr = td.eq(5).find('span').attr('title');
    return {
      id: td.eq(0).text(),
      title: td.eq(1).text().trim(),
      date: parseDate(dateStr),
      dateStr,
    };
  }).get();
}

function parseAssignmentList(html) {
  const $ = cheerio.load(html);
  if ($('#main').text().indexOf('目前尚無資料') !== -1) {
    return [];
  }
  return $('#main tr').slice(1).map((i, tr) => {
    const td = $(tr).find('td');
    const href = td.eq(1).find('a').eq(0).attr('href');
    const dateStr = td.eq(4).find('span').attr('title');
    return {
      id: href.match(/.*hw=(\d+).*/)[1],
      title: td.eq(1).text().trim(),
      date: parseDate(dateStr),
      dateStr,
    };
  }).get();
}

function parseForumList(html) {
  const $ = cheerio.load(html);
  if ($('#main').text().indexOf('目前尚無資料') !== -1) {
    return [];
  }
  return $('#main tr').filter(i => i % 2 === 1).map((i, tr) => {
    const td = $(tr).find('td');
    const count = td.eq(2).find('span').eq(0).text();
    const lastEdit = td.eq(3).text().trim();
    return {
      id: td.eq(0).text(),
      title: td.eq(1).text(),
      subtitle: `${I18n.t('lastEdit')}: ${lastEdit}`,
      count,
    };
  }).get();
}

export function parseItemList(itemType, html) {
  if (itemType === 'announcement') {
    return parseAnnouncementList(html);
  }
  if (itemType === 'material') {
    return parseMaterialList(html);
  }
  if (itemType === 'assignment') {
    return parseAssignmentList(html);
  }
  if (itemType === 'forum') {
    return parseForumList(html);
  }
  return [];
}


function parseAnnouncementDetail(html) {
  const item = JSON.parse(html).news;
  const attachRoot = HTMLParser.parse(item.attach);
  const attachments = attachRoot.querySelectorAll('a')
  .map(attach => ({
    id: attach.attributes.href.match(/.*id=(\d+).*/)[1],
    name: attach.text,
  }));
  return {
    content: item.note,
    dateStr: item.createTime,
    date: parseDate(item.createTime),
    attachments,
  };
}

function parseMaterialDetail(html) {
  const root = HTMLParser.parse(html);
  const title = root.querySelector('#doc .title').text;
  const poster = root.querySelector('.poster').text;
  const dateStr = `${poster.split(', ')[1]}:00`;
  const content = root.querySelector('#doc .article').text;
  const attachments = root.querySelectorAll('div.attach div.block div')
  .map((attach) => {
    const link = attach.querySelectorAll('a')[1];
    return {
      id: link.attributes.href.match(/.*id=(\d+).*/)[1],
      name: link.attributes.title,
    };
  });
  return {
    title,
    content,
    dateStr,
    date: parseDate(dateStr),
    attachments,
  };
}

function parseAssignmentDetail(html) {
  const root = HTMLParser.parse(html);
  const title = root.querySelector('#main span.curr').text;
  const tr = root.querySelectorAll('tr');
  const dateStr = `${tr[5].querySelectorAll('td')[1].text}:00`;
  const content = tr[6].querySelectorAll('td')[1].text;
  const links = tr[7].querySelectorAll('a');
  const attachments = links.map(link => ({
    id: link.attributes.href.match(/.*id=(\d+).*/)[1],
    name: link.text,
  }));
  return {
    title,
    content,
    dateStr,
    date: parseDate(dateStr),
    attachments,
  };
}

export function parseItemDetail(itemType, html) {
  if (itemType === 'announcement') {
    return parseAnnouncementDetail(html);
  }
  if (itemType === 'material') {
    return parseMaterialDetail(html);
  }
  if (itemType === 'assignment') {
    return parseAssignmentDetail(html);
  }
  return {};
}

export function parseForum(posts) {
  return {
    id: posts.id,
    title: posts.title,
    count: posts.items.length - 1,
    posts: posts.items.map(item => ({
      id: item.id,
      name: item.name,
      account: item.account,
      email: item.email,
      date: item.date,
      content: item.note,
    })),
  };
}

function parseEmailLine(line) {
  const type = line.text.split(':')[0].trim();
  const names = line.text.split(':')[1].split(',')
    .map(name => name.trim())
    .filter(name => name !== '無' && name !== 'None');
  const emails = line.querySelectorAll('img')
    .filter(img => img.attributes.src.endsWith('mail.png'))
    .map(img => img.attributes.title);
  return names.map((name, i) => ({
    name: `${type}: ${name}`,
    email: emails[i],
  }));
}

export function parseEmailList(html) {
  const root = HTMLParser.parse(html);
  const boxBody = root.querySelectorAll('#menu div.boxBody');
  const infoBox = boxBody[boxBody.length - 1];
  const teacherEmailLine = infoBox.querySelectorAll('div')[4];
  const taEmailLine = infoBox.querySelectorAll('div')[5];
  return [
    ...parseEmailLine(teacherEmailLine),
    ...parseEmailLine(taEmailLine),
  ];
}

export function parseScore(html) {
  const root = HTMLParser.parse(html);
  if (root.querySelector('#main').text.indexOf('不開放') !== -1) {
    return null;
  }
  const tr = root.querySelectorAll('#main tr');
  const scoreHeader = tr[0].querySelectorAll('td').slice(4);
  const scoreRow = tr[1].querySelectorAll('td').slice(4);

  return scoreRow.map((row, i) => {
    const text = scoreHeader[i].text;
    const percent = text.match(/\((.*)\)/);
    return {
      name: text.replace(/\(.*\)/, ''),
      percent: percent ? percent[1] : '',
      score: row.text,
    };
  });
}

