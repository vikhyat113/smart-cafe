const Settings = require('../models/Settings');

// GET /api/settings (public — frontend needs cafe name/currency etc.)
async function getSettings(req, res) {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.json(settings);
}

// PUT /api/settings (admin)
async function updateSettings(req, res) {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({});
  }

  const fields = ['cafeName', 'logo', 'phone', 'address', 'openingHours', 'currencySymbol', 'totalTables'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      settings[field] = field === 'totalTables' ? Number(req.body[field]) : req.body[field];
    }
  });

  await settings.save();
  res.json(settings);
}

module.exports = { getSettings, updateSettings };
