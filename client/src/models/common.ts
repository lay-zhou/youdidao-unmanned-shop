import Taro from '@tarojs/taro';

export default {
  namespace: 'common',
  state: {
    cartChecked: true,
    cartItems: [],
    newState: {},
    data: '',
    address: null,
    distance: null,
    receiverInfo: null,
  },

  effects: {
    //加入购物车
    * addToCartByCode({ payload }, { put, select }) {
      console.log('payload', payload);

      const cartItems = yield select(state => state.common.cartItems);
      console.log('加入购物车cartItems', cartItems);
      if (cartItems) {
        console.log('cartItems.length > 0');
        Taro.showTabBarRedDot({
          index: 2
        })
      }
      let index;
      if (payload.itemId) {
        index = cartItems.findIndex(currentValue => currentValue.itemId === payload.itemId);
      } else {
        index = cartItems.findIndex(currentValue => currentValue.itemId === payload);
      }
      console.log('index',index);
      
      if (index === -1) {
        try {
          yield put({
            type: 'cartItemsAppend',
            payload,
          });
          setTimeout(function () {
            Taro.showToast({
              title: '成功加入购物车',
              icon: 'succes',
              mask: true,
            })
          }, 100)
        } catch (e) {
          Taro.showToast({
            title: '加入失败请重试',
            duration: 1500,
            mask: true,
            image: 'https://mengmao-qingying-files.oss-cn-hangzhou.aliyuncs.com/failure.png',
          });
        }
      } else {
        yield put({
          type: 'addOneToCartItemNumerByIndex',
          payload: index,
        });
        setTimeout(function () {
          Taro.showToast({
            title: '成功加入购物车',
            icon: 'succes',
            mask: true,
          })
        }, 10)
      }
    },
    //商品删除
    * delete(payload, { put, select }) {
      const cartItems = yield select(state => state.common.cartItems);
      console.log('商品删除', cartItems);

      yield put({
        type: 'deleteCheckedCartItems',
      });
    },
  },

  reducers: {
    save(state, { payload }) {
      console.log('state', state);

      return { ...state, ...payload };
    },
    //存入加入购物车的值
    cartItemsAppend(state, { payload: item }) {


      const { cartItems } = state;
      console.log('存入加入购物车的值', cartItems);
      cartItems.push({ ...item, checked: true });
      return {
        ...state,
        cartItems: cartItems.slice(),
      };
    },
    //加减
    addOneToCartItemNumerByIndex(state, { payload: index }) {
      const { cartItems } = state;
      cartItems[index].number += 1;
      return {
        ...state,
        cartItems: cartItems.slice(),
      };
    },
    //勾选商品
    changeCartItemsChecked(state, { payload: checkeds }) {
      const { cartItems } = state;
      const currentCartChecked = checkeds.findIndex(currentValue => currentValue === 'all') !== -1;
      const cartItemCheckedCodes = checkeds.filter(currentValue => currentValue !== 'all');
      for (let i = 0; i < cartItems.length; i++) {
        const cartItem = cartItems[i];
        cartItem.checked = cartItemCheckedCodes.findIndex(currentValue => currentValue === cartItem.itemId) !== -1;
      }
      return {
        ...state,
        cartChecked: currentCartChecked,
        cartItems: cartItems.slice(),
      };
    },
    //全选商品
    changeAllCheckedCartItems(state, { payload: check }) {
      const { cartItems } = state;
      for (let i = 0; i < cartItems.length; i++) {
        cartItems[i].checked = !check;
      }
      return state;
    },
    deleteCheckedCartItems(state) {


      const { cartItems } = state;
      console.log('deleteCheckedCartItems', cartItems);
      const uncheckedCartItems = cartItems.filter(currentValue => !currentValue.checked);
      console.log('deleteCheckedCartItems uncheckedCartItems', uncheckedCartItems);
      const newState = {
        ...state,
        cartItems: uncheckedCartItems,
      };
      return newState;
    },
    deleteCartItems(state) {
      const { cartItems } = state;
      console.log('deleteCartItems');

      cartItems.findIndex((currentValue, index) => {
        if (currentValue.checked !== false) {
          cartItems.splice(index, 1)
        }
      });
      return {
        ...state,
        cartItems: cartItems.slice(),
      }
    },
    //获取商品的数量
    changeCartItemNumer(state, { payload: { itemId, number } }) {
      console.log('获取商品数量');

      const { cartItems } = state;
      const index = cartItems.findIndex(currentValue => currentValue.itemId === itemId);
      cartItems[index].number = number;
      const newState = {
        ...state,
        cartItems: cartItems.slice(),
      };
      return newState;
    },
    // 同步更新地址
    preAddress(state, { payload }) {
      return {
        ...state,
        receiverInfo: payload.receiverInfo,
        distance: payload.distance,
      };
    }

  },

};
