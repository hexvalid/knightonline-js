import { IGameSocket } from "../game_socket";
import { SendMessageToPlayer, ChatMessageType } from "./sendChatMessage";
import { AllSend, RegionQuery, RUserMap, RSessionMap, RegionQueryUsersByNpc, RNPCMap } from "../region";
import { string, byte_string } from "../../core/utils/unit";
import { SendWarp } from "./sendWarp";
import { Npc } from "../../core/database/models";
import { SendRegionNpcIn } from "./sendRegionInOut";
import { SendTargetHP } from "./sendTargetHP";
import { SummonNPC } from "../ai_system/summon";

export const GM_COMMANDS_HEADER = '[GM CONTROLLER]';

export function SendUsageMessageForGM(socket: IGameSocket, message: string) {
  SendMessageToPlayer(socket, ChatMessageType.PRIVATE, GM_COMMANDS_HEADER, message);
}

export const GM_COMMANDS = {
  notice: (args: string[], socket: IGameSocket, opcode: number) => {
    let text = args.join(' ');
    if (text.length == 0) {
      return SendUsageMessageForGM(socket, `USAGE: notice text`);
    }

    AllSend(socket, [
      opcode, ChatMessageType.WAR_SYSTEM, 0, 0, 0, 0, ...string(`### NOTICE: ${text} ###`, 'ascii')
    ]);
  },

  chat: (args, socket, opcode) => {
    let text = args.join(' ');
    if (text.length == 0) {
      return SendUsageMessageForGM(socket, `USAGE: chat text`);
    }

    AllSend(socket, [
      opcode, ChatMessageType.PUBLIC, 0, 0, 0, 0, ...string(`### NOTICE: ${text} ###`, 'ascii')
    ]);
  },

  pm: (args, socket, opcode) => {
    let text = args.join(' ');
    if (text.length == 0) {
      return SendUsageMessageForGM(socket, `USAGE: pm text`);
    }

    let message = [
      opcode, ChatMessageType.PRIVATE, 0, 0, 0, ...byte_string('[SERVER]'), ...string(text, 'ascii')
    ];

    for (let s of RegionQuery(socket, { all: true })) {
      message[2] = s.user.nation;
      s.send(message);
    }
  },

  count: (args, socket) => {
    SendUsageMessageForGM(socket, `count: ${Object.keys(RSessionMap).length}`);
  },

  near: (args, socket) => {
    for (let s of RegionQuery(socket)) {
      SendUsageMessageForGM(socket, s.character.name + ': ' + ((s.character.x * 10 >>> 0) / 10) + ' ' + ((s.character.z * 10 >>> 0) / 10));
    }
  },

  help: (args, socket) => {
    SendUsageMessageForGM(socket, `HELP: ${GM_COMMANDS_LIST.join(', ')}`);
  },

  zone: (args, socket) => {
    let id = args.join(' ');
    if (id.length == 0) {
      return SendUsageMessageForGM(socket, `USAGE: zone id`);
    }

    SendWarp(socket, +id);
  },

  npc: (args, socket) => {
    let name = args.join(' ');
    if (!name) {
      return SendUsageMessageForGM(socket, `USAGE: npc name`);
    }

    Npc.findOne({
      name: new RegExp(name, 'i'),
      isMonster: true
    }).then(npc => {
      if (!npc) {
        throw new Error(`Unknown npc name! "${name}"`)
      }

      SendUsageMessageForGM(socket, `Npc found! ${npc.name} id: ${npc.id}`);
    }).catch(e => {
      SendUsageMessageForGM(socket, `ERROR: ${e.message}`);
    })
  },

  summon: (args, socket) => {
    let id = args.join(' ');
    if (!id) {
      return SendUsageMessageForGM(socket, `USAGE: summon id`);
    }

    Npc.findOne({
      id: +id,
      isMonster: true
    }).then(npc => {
      if (!npc) {
        throw new Error(`Unknown npc id! "${id}"`)
      }

      return SummonNPC(npc, {
        zone: socket.character.zone,
        leftX: socket.character.x,
        rightX: socket.character.x,
        topZ: socket.character.z,
        bottomZ: socket.character.z,
        direction: socket.character.direction,
        spawnedBy: 'gm'
      });
    }).then(npcInstance => {
      for (let userSocket of RegionQueryUsersByNpc(npcInstance)) {
        SendRegionNpcIn(userSocket, npcInstance);
      }


      SendUsageMessageForGM(socket, `Summoned! "${npcInstance.npc.name}" uuid:${npcInstance.uuid}`);
    }).catch(e => {
      SendUsageMessageForGM(socket, `ERROR: ${e.message}`);
    })
  },

  saitama: (args, socket) => {
    if (socket.variables.saitama) {
      socket.variables.saitama = false;
      SendUsageMessageForGM(socket, 'Saitama mod disabled');
    } else {
      socket.variables.saitama = true;
      SendUsageMessageForGM(socket,  'Saitama mod activated');
    }
  },

  hp_set: (args, socket) => {
    let hp = +args[0];

    if (isNaN(hp) || !hp) {
      return SendUsageMessageForGM(socket, `USAGE: hp_set hp`);
    }

    if (socket.target) {
      let npcRegion = RNPCMap[socket.target];

      if (npcRegion) {
        npcRegion.npc.hp = +args[0];
        SendTargetHP(socket, 0, 0);
      }
    }
  }
}

export const GM_COMMANDS_LIST = Object.keys(GM_COMMANDS);