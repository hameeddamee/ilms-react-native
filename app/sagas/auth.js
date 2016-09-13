import { takeEvery } from 'redux-saga';
import { call, fork, put, take } from 'redux-saga/effects';
import { ToastAndroid, Alert, Platform } from 'react-native';
import { Actions, ActionConst } from 'react-native-router-flux';
import api from '../utils/api';
import { parseProfile } from '../utils/parser';
import {
  CHECK_LOGIN,
  LOGIN,
  LOGOUT,
} from '../containers/Auth/actionTypes';
import {
  checkLoginSuccess,
  loginSuccess,
  loginFail,
  loginError,
  fetchProfileSuccess,
} from '../containers/Auth/actions';
import { fetchCourseList } from '../containers/Course/actions/courseList';

function* checkLogin() {
  const { isLogin, html } = yield call(api.checkLogin);
  console.log(isLogin, html);
  if (!isLogin) {
    if (Platform.OS === 'android')
      ToastAndroid.show('尚未登入', ToastAndroid.SHORT);
    else
      Alert.alert('尚未登入');
    Actions.login({ type: ActionConst.REPLACE });
    return;
  }
  yield put(checkLoginSuccess());

  const user = parseProfile(html);
  yield put(fetchProfileSuccess(user));
  yield put(fetchCourseList());
}

function* watchCheckLogin() {
  yield* takeEvery(CHECK_LOGIN, checkLogin);
}

function* login({ account, password }) {
  try {
    const data = {
      account,
      password,
      secCode: 'na',
      stay: 1,
    };
    const res = yield call(api.post, '/sys/lib/ajax/login_submit.php', data);
    const { ret } = yield res.json();
    if (ret.status === 'true') {
      yield put(loginSuccess({
        email: ret.email,
      }));
      Actions.home({ type: ActionConst.REPLACE });

      yield take(LOGOUT);
    } else {
      if(Platform.OS === 'android')
        ToastAndroid.show(ret.msg, ToastAndroid.SHORT);
      else
        Alert.alert(ret.msg);
      yield put(loginFail(ret.msg));
    }
  } catch (error) {
    if(Platform.OS === 'android')
      ToastAndroid.show('登入失敗', ToastAndroid.SHORT);
    else
      Alert.alert('登入失敗');
    yield put(loginError(error.message));
  }
}

function* watchLogin() {
  yield* takeEvery(LOGIN, login);
}

function* logout() {
  yield call(api.post, '/sys/lib/ajax/logout.php');
  Actions.login({ type: ActionConst.REPLACE });
}

function* watchLogout() {
  yield* takeEvery(LOGOUT, logout);
}

export default function* authSaga() {
  yield fork(watchCheckLogin);
  yield fork(watchLogin);
  yield fork(watchLogout);
}

