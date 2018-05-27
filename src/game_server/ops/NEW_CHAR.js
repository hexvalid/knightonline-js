const config = require('config');

module.exports = async function ({ socket, opcode, body, db }) {
  let index = body.byte();
  let name = body.string();
  let race = body.byte();
  let klass = body.short();
  let face = body.byte();
  let hair = body.uint();
  let str = body.byte();
  let hp = body.byte();
  let dex = body.byte();
  let int = body.byte();
  let mp = body.byte();

  if (index > 2) {
    return socket.sendWithHeaders([
      opcode, 1 // NO_MORE
    ]);
  }

  if (!isKlassValid(klass) || (str + hp + dex + int + mp) > 300) {
    return socket.sendWithHeaders([
      opcode, 2 // NEWCHAR_INVALID_DETAILS
    ]);
  }

  if (str < 50 || hp < 50 || dex < 50 || int < 50 || mp < 50) {
    return socket.sendWithHeaders([
      opcode, 11 // NEWCHAR_STAT_TOO_LOW
    ]);
  }

  if ((socket.user.nation == 'KARUS' && race > 10) || (socket.user.nation == 'ELMORAD' && race < 10)) {
    return socket.sendWithHeaders([
      opcode, 2 // NEWCHAR_INVALID_DETAILS
    ]);
  }

  let { Character } = db.models;
  let nameControl = await Character.findOne({
    name
  }).exec();

  if (nameControl) {
    return socket.sendWithHeaders([
      opcode, 3 // NEWCHAR_EXISTS
    ]);
  }

  var error = false;
  try {
    let character = new Character({
      name,
      race,
      klass,
      hair,
      level: 1,
      face,
      statStr: str,
      statHp: hp,
      statDex: dex,
      statMp: mp,
      statInt: int,
      gold: 10, // 10 noah start
      items: startingItems(klass)
    });


    await character.save();

    if (!socket.user.characters) {
      socket.user.characters = [];
    }

    socket.user.characters.push(character._id);

    socket.user.save();
  } catch (e) {
    error = true;
  }

  if (error) {
    return socket.sendWithHeaders([
      opcode, 4 // NEWCHAR_DB_ERROR
    ]);
  }

  socket.sendWithHeaders([
    opcode, 0 // NEWCHAR_SUCCESS
  ]);
}

function isKlassValid(klass) {
  if (klass >= 101 && klass <= 115) {
    return true;
  }

  if (klass >= 201 && klass <= 215) {
    return true;
  }

  return false;
}

/**
 * 
 * @param {String} klass 
 * @return {'warrior'|'rogue'|'magician'|'priest'|'kurian'}
 */
function simplifyKlass(klass) {
  if (klass >= 100 && klass < 200) {
    klass -= 100;
  } else if (klass >= 200 && klass < 300) {
    klass -= 200;
  } else {
    return '';
  }

  if (klass == 1 || klass == 5 || klass == 6) {
    return 'warrior';
  }

  if (klass == 2 || klass == 7 || klass == 8) {
    return 'rogue';
  }

  if (klass == 3 || klass == 9 || klass == 10) {
    return 'magician';
  }

  if (klass == 4 || klass == 11 || klass == 12) {
    return 'priest';
  }

  if (klass == 5 || klass == 13 || klass == 14) {
    return 'kurian';
  }
}

function startingItems(klass) {
  try {
    klass = simplifyKlass(klass);
    let data = config.get('gameServer.startItems.' + klass);
    if (!data) {
      throw 1;
    }

    return Buffer.from(data, 'hex');

  } catch (e) {
    return Buffer.alloc(8 * 150); // 1200 byte0
  }
}