import { IGameSocket } from "../game_socket";
import { string, byte_string, short } from "../../core/utils/unit";

const notices = [
  ['KO-JS', 'Welcome to Knight Online Javascript Server']
];

export function SendNotices(socket: IGameSocket) {
  let u = socket.user;
  let c = socket.character;

  let nation = u.nation;

  socket.send([
    0x2E,
    2,
    notices.length,
    ...[].concat(...notices.map(notice => [
      ...string(notice[0]),
      ...string(notice[1])
    ]))
  ]);

  socket.send([
    0x2E,
    1,
    notices.length,
    ...[].concat(...notices.map(notice => [
      ...byte_string(notice[1] + ' ' + notice[1])
    ]))
  ]);

  socket.send([
    0x10, // CHAT
    5,
    nation,
    ...short(socket.session & 0xFFFF),
    0,
    ...string(`[SERVER] Server Time: ${new Date().toLocaleString('en-GB')}`)
  ]);

  socket.send([
    0x10, // CHAT
    5,
    nation,
    ...short(socket.session & 0xFFFF),
    0,
    ...string(`[SERVER] Welcome ${c.name}, ko-js is really working :)`)
  ]);
}
