import { call, select, put, all, takeLatest } from 'redux-saga/effects';

import { toast } from 'react-toastify';

import { formatPriceBrl } from '../../../util/format';

import api from '../../../services/api';
import { addToCartSuccess, updateAmount } from './actions';

function* addToCart({ id }) {
  const productExistis = yield select(state =>
    state.cart.find(p => p.id === id)
  );

  const stock = yield call(api.get, `/stock/${id}`);

  const stockAmount = stock.data.amount;
  const currentAmount = productExistis ? productExistis.amount : 0;

  const amount = currentAmount + 1;

  if (amount > stockAmount) {
    toast.error('Estoque insuficiente');
    return;
  }

  if (productExistis) {
    yield put(updateAmount(id, amount));
  } else {
    const response = yield call(api.get, `/products/${id}`);

    const data = {
      ...response.data,
      amount: 1,
      priceFormatted: formatPriceBrl(response.data.price),
    };

    yield put(addToCartSuccess(data));
  }
}

export default all([takeLatest('@cart/ADD_REQUEST', addToCart)]);
