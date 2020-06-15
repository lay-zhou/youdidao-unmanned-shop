module.exports = () => {
  return async (ctx, next) => {
    const { app, socket, model } = ctx;
    // 每次随机生成的设备号
    const id = socket.id;
    const nsp = app.io.of('/');

    const query = socket.handshake.query;

    console.log('app middleware auth query', query);

    // 用户传递的信息
    const { userId } = query;
    const { id: storeId } = await model.Store.findOne({
      where: {
        userId,
      }
    })

    // 将这个人的id及设备号存储至redis
    await app.redis.set(`${storeId}`, id);

    const room = 'demo';

    const rooms = [room];
    // 用户加入
    console.log('#用户加入了连接', room);

    // 在线列表
    nsp.adapter.clients(rooms, (err, clients) => {
      console.log('#online_join', clients);
      if (err) console.log('err', err);
      // 更新在线用户列表
      nsp.to(room).emit('online', {
        clients,
        action: 'join',
        target: 'participator',
        message: `User(${id}) joined.`,
      });
    });

    await next();

    // 用户离开
    console.log('#用户离开了连接', room);

    // 在线列表
    nsp.adapter.clients(rooms, (err, clients) => {
      console.log('#online_leave', clients);
      if (err) console.log('err', err);
      // 获取 client 信息
      const clientsDetail = {};
      clients.forEach(client => {
        const _client = app.io.sockets.sockets[client];
        const _query = _client.handshake.query;
        clientsDetail[client] = _query;
      });

      // 更新在线用户列表
      nsp.to(room).emit('online', {
        clients,
        action: 'leave',
        target: 'participator',
        message: `User(${id}) leaved.`,
      });
    });
  };
};