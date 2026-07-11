// Socket.IO 实时协作模块
function setupSocketIO(io) {
  io.on('connection', (socket) => {
    console.log(`用户连接: ${socket.id}`);

    // 加入房间（可按店铺分组）
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} 加入房间: ${room}`);
    });

    // 监听入场记录更新
    socket.on('entry:update', (data) => {
      console.log(`转发入场记录更新: ${data.storeNumber}`);
      socket.broadcast.emit('entry:update', data);
    });

    // 监听撤场记录更新
    socket.on('exitStore:update', (data) => {
      console.log(`转发撤场记录更新: ${data.storeNumber}`);
      socket.broadcast.emit('exitStore:update', data);
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`用户断开: ${socket.id}`);
    });
  });
}

module.exports = { setupSocketIO };
