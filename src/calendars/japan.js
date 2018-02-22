import moment from 'moment';
import range from 'moment-range';
import _ from 'lodash';

import { Dates, Utils } from '../lib';
import { Titles, Types, LiturgicalColors } from '../constants';

let _dates = [
  {
    "key": "saintPaulMikiAndCompanionsMartyrs",
    "type": Types[4],
    "moment": moment.utc({ year: arguments[0], month: 1, day: 6 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.RED,
        "titles": [
          Titles.MARTYR
        ]
      }
    }
  },
  {
    "key": "discoveryOfTheHiddenChristians",
    "type": Types[6],
    "moment": moment.utc({ year: arguments[0], month: 2, day: 17 }),
    "data": {}
  },
  {
    "key": "blessedPeterKibePriestAndCompanionsMartyrs",
    "type": Types[5],
    "moment": moment.utc({ year: arguments[0], month: 6, day: 1 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.RED,
        "titles": [
          Titles.MARTYR
        ]
      }
    }
  },
  {
    "key": "205BlessedMartyrsOfJapan",
    "type": Types[5],
    "moment": moment.utc({ year: arguments[0], month: 8, day: 10 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE
      }
    }
  },
  {
    "key": "saintThomasRokuzayemonPriestAndCompanionsMartyrs",
    "type": Types[5],
    "moment": moment.utc({ year: arguments[0], month: 8, day: 28 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE
      }
    }
  },
  {
    "key": "saintFrancisXavierPriest",
    "type": Types[4],
    "moment": moment.utc({ year: arguments[0], month: 11, day: 3 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE
      }
    }
  }
];

let dates = () => {
  // Get localized celebration names
  return _.map( _dates, date => {
    date.name = Utils.localize({
      key: 'national.' + date.key
    });
    return date;
  });
};

export {
  dates 
};