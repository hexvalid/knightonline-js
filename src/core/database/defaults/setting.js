module.exports = async function (db) {
  let defaultSettings = {
    'test': ['bool', true, 'DELETED']
  };

  let { Setting } = db.models;

  for (let [key, value] of Object.entries(defaultSettings)) {
    let data;

    if (!(data = await Setting.findOne({
      key
    }).exec())) {
      if (value[2] == 'DELETED') continue;

      let setting = new Setting({
        key, value: value[1], type: value[0]
      });

      await setting.save();

      console.log('A setting has been defined! | (%s) %s =', value[0], key, value[1])
    } else {
      if (value[2] == 'DELETED' && data) {
        await data.remove();

        console.log('A setting has been removed! | (%s) %s = NULL', value[0], key)
      }
    }
  }
}