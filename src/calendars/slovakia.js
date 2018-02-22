import moment from 'moment';
import range from 'moment-range';
import _ from 'lodash';

import { Dates, Utils } from '../lib';
import { Titles, Types, LiturgicalColors } from '../constants';

let _dates = [
  {
    "key": "saintsCyrilMonkAndMethodiusBishop",
    "type": Types[4],
    "moment": moment.utc({ year: arguments[0], month: 1, day: 14 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE,
        "titles": [ Titles.PATRON_OF_EUROPE ]
      }
    }
  },
  {
    "key": "saintAdalbertBishopAndMartyr",
    "type": Types[5],
    "moment": moment.utc({ year: arguments[0], month: 3, day: 23 }),
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
    "key": "saintGeorgeMartyr",
    "type": Types[6],
    "moment": moment.utc({ year: arguments[0], month: 3, day: 24 }),
    "data": {
      "meta": {
        "titles": [
          Titles.MARTYR
        ]
      }
    }
  },
  {
    "key": "saintCatherineOfSienaVirginAndDoctorOfTheChurch",
    "type": Types[4],
    "moment": moment.utc({ year: arguments[0], month: 3, day: 29 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE,
        "titles": [
          Titles.PATRON_OF_EUROPE,
          Titles.DOCTOR_OF_THE_CHURCH
        ]
      }
    }
  },
  {
    "key": "blessedSaraSalkahaziVirginAndMartyr",
    "type": Types[6],
    "moment": moment.utc({ year: arguments[0], month: 4, day: 11 }),
    "data": {
      "meta": {
        "titles": [
          Titles.MARTYR
        ]
      }
    }
  },
  {
    "key": "saintJohnNepomucenePriestAndMartyr",
    "type": Types[5],
    "moment": moment.utc({ year: arguments[0], month: 4, day: 16 }),
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
    "key": "saintLadislaus",
    "type": Types[6],
    "moment": moment.utc({ year: arguments[0], month: 5, day: 27 }),
    "data": {}
  },
  {
    "key": "visitationOfTheBlessedVirginMary",
    "type": Types[4],
    "moment": moment.utc({ year: arguments[0], month: 6, day: 2 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE
      }
    }
  },
  {
    "key": "saintsCyrilAndMethodiusSlavicMissionaries",
    "type": Types[0],
    "moment": moment.utc({ year: arguments[0], month: 6, day: 5 }),
    "data": {}
  },
  {
    "key": "saintAnthonyZaccariaPriest",
    "type": Types[6],
    "moment": moment.utc({ year: arguments[0], month: 6, day: 7 }),
    "data": {}
  },
  {
    "key": "saintBenedictOfNursiaAbbot",
    "type": Types[4],
    "moment": moment.utc({ year: arguments[0], month: 6, day: 11 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE,
        "titles": [ Titles.PATRON_OF_EUROPE ]
      }
    }
  },
  {
    "key": "saintsAndrewZoerardusAndBenedictEremites",
    "type": Types[5],
    "moment": moment.utc({ year: arguments[0], month: 6, day: 17 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE
      }
    }
  },
  {
    "key": "saintBirgittaReligious",
    "type": Types[4],
    "moment": moment.utc({ year: arguments[0], month: 6, day: 23 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE
      }
    }
  },
  {
    "key": "saintGorazdAndCompanions",
    "type": Types[5],
    "moment": moment.utc({ year: arguments[0], month: 6, day: 27 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE
      }
    }
  },
  {
    "key": "blessedZdenkaSchelingovaVirginAndMartyr",
    "type": Types[6],
    "moment": moment.utc({ year: arguments[0], month: 6, day: 30 }),
    "data": {
      "meta": {
        "titles": [
          Titles.MARTYR
        ]
      }
    }
  },
  {
    "key": "saintTeresaBenedictaOfTheCrossEdithSteinVirginAndMartyr",
    "type": Types[4],
    "moment": moment.utc({ year: arguments[0], month: 7, day: 9 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.RED,
        "titles": [
          Titles.MARTYR,
          Titles.PATRON_OF_EUROPE
        ]
      }
    }
  },
  {
    "key": "saintsMarkoKrizinMelicharGrodeckiAndStephenPongracPriestsAndMartyrs",
    "type": Types[5],
    "moment": moment.utc({ year: arguments[0], month: 8, day: 7 }),
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
    "key": "ourLadyOfSorrowsPatronessOfSlovakia",
    "type": Types[0],
    "moment": moment.utc({ year: arguments[0], month: 8, day: 15 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE
      }
    }
  },
  {
    "key": "saintEmeric",
    "type": Types[6],
    "moment": moment.utc({ year: arguments[0], month: 10, day: 5 }),
    "data": {}
  },
  {
    "key": "ourLordJesusChristTheEternalHighPriest",
    "type": Types[4],
    "moment": moment.utc({ year: arguments[0], month: 5, day: 16 }),
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