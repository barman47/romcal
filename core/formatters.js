var moment = require('moment'),
	twix = require('twix'),
	lodash = require('lodash'),
	utils = require('./utils'),
	solemnities = require('./solemnities'),
	seasons = require('./seasons'),
	types = utils.types(),
	categories = utils.categories(),
	ordinalNumbers = utils.ordinalNumbers(),
	liturgicalColors = utils.liturgicalColors();

var getDatesByDay = function( dates, day ) {
	    return lodash.filter( dates, function( value, key ) {
	        return value.moment.day() === day;
	    });
	},
	getDaysGrouped = function( dates ) {
		var result = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
		lodash.map( dates, function( value, key ) {
			result[ value.moment.day() ].push( value );
		});
		return result;
	},
	getDatesByMonth = function( dates, month ) {
		return lodash.filter( dates, function( key, value ) {
			return value.moment.month() === month;
		});
	};

module.exports = {

	generateCalendarDates: function( year ) {
		
		var dateOfEaster = utils.dateOfEaster( year ),
			fixedSolemnities = solemnities.fixedSolemnities( year );
		
        // Some adjustments for immaculate conception if it falls on a Sunday of Advent
        var data = seasons.adventSeason( fixedSolemnities ),
        	adventSeason = data.adventSeason,
        
        fixedSolemnities = data.fixedSolemnities;
        
        // The function _movableSolemnities calculates the date of epiphany based on the epiphany rubric
        var	movableSolemnities = solemnities.movableSolemnities( dateOfEaster, adventSeason.the1stSundayOfAdvent.moment );
		
		// The function _seasonOfLent does calculations for 2 feasts which may overlap holy week
		var result = seasons.seasonOfLent( dateOfEaster, fixedSolemnities, movableSolemnities ),
			lentSeason = result.lentSeason;

		fixedSolemnities = result.fixedSolemnities;
		movableSolemnities = result.movableSolemnities;

		// The function _feastsOfTheLord calculates much of the rules described in the epiphany rubric
		var response = seasons.feastsOfTheLord( fixedSolemnities, movableSolemnities ),
			feastsOfTheLord = response.feastsOfTheLord;
		
		movableSolemnities = response.movableSolemnities;
		
			// Output of ordinary time is based on the output of _seasonOfLent and _feastsOfTheLord
		var ordinaryTime = seasons.ordinaryTime( movableSolemnities, feastsOfTheLord, fixedSolemnities ),
			// Get all other feasts and memorials in the general roman calendar
		 	otherCelebrations = require('./otherCelebrations').dates( year ),
        	// Get season duration ranges
         	seasonRanges = seasons.seasonRanges( fixedSolemnities, movableSolemnities, adventSeason, feastsOfTheLord );

     	return {
     		fixedSolemnities: fixedSolemnities,
     		movableSolemnities: movableSolemnities,
     		feastsOfTheLord: feastsOfTheLord,
     		adventSeason: adventSeason,
     		lentSeason: lentSeason,
     		ordinaryTime: ordinaryTime,
     		otherCelebrations: otherCelebrations,
     		seasonRanges: seasonRanges
     	};
	},

	mergeAndSort: function( dates ) {
		
		var merged = {};
		lodash.forEach( dates, function( item ) {
			lodash.merge( merged, item );
		});

		var liturgicalDates = [],
			sortedDates = [];

		lodash.map( merged, function( value, key, collection ) {
			value.data = {};
			value.literalKey = key;
			liturgicalDates.push( value );
		});

        // Sort dates in ascending order
		sortedDates = lodash.sortBy( liturgicalDates, function( value ) {
			return value.moment.valueOf();
		});

		return sortedDates;
	},

	resolveCoincidingEvents: function( dates ) {
        var filtered = {};
        lodash.forEach( dates, function( value ) {

            var k = value.moment.valueOf();
            if ( lodash.isUndefined( filtered[ k ] ) ) {
                filtered[ k ] = value;
            }
            else {

                var existing = filtered[ k ], // The existing date
                	candidate = value; // The date to test

            	// If a memorial/opt. memorial will replace a weekeday in lent,
            	// it will be reduced to the rank of commemoration
            	if ( lodash.isEqual( existing.type.id, types.WEEKDAY_OF_LENT.id ) || lodash.isEqual( candidate.type.id, types.WEEKDAY_OF_LENT.id ) ) {
	        		if ( lodash.isEqual( candidate.type.id, types.MEMORIAL.id ) || lodash.isEqual( candidate.type.id, types.OPT_MEMORIAL.id ) || lodash.isEqual( candidate.type.id, types.MEMORIAL_MARTYR.id ) || lodash.isEqual( candidate.type.id, types.OPT_MEMORIAL_MARTYR.id ) )
	    				candidate.type = types.COMMEM;
	    			if ( lodash.isEqual( existing.type.id, types.MEMORIAL.id ) || lodash.isEqual( existing.type.id, types.OPT_MEMORIAL.id ) || lodash.isEqual( existing.type.id, types.MEMORIAL_MARTYR.id ) || lodash.isEqual( existing.type.id, types.OPT_MEMORIAL_MARTYR.id ) )
	    				existing.type = types.COMMEM;
	    		}

                // If the overlapping date ranks higher than the current date, it will replace that date
                if ( candidate.type.rank > existing.type.rank )
                    filtered[k] = candidate;

            }
        });
		var filtered = lodash.values( filtered );
		return filtered
	},

	setLiturgicalColorsAndSeasons: function( dates, seasonRanges ) {

		// The proper color of Ordinary Time is green.
		// The proper color of the Easter and Christmas seasons is white.
		var sundayWeekdayHandler = function( d ) {
			if ( seasonRanges.earlierOrdinaryTime.contains( d.moment ) || seasonRanges.latterOrdinaryTime.contains( d.moment ) )
				return liturgicalColors.GREEN;
			else if ( seasonRanges.easterSeasonRange.contains( d.moment ) )
				return liturgicalColors.WHITE;
			else if ( seasonRanges.christmasOctaveRange.contains( d.moment ) )
				return liturgicalColors.WHITE;
			else
				return liturgicalColors.GREEN;
		};

		var weekdayOfEpiphanyHandler = function( d ) {
			return liturgicalColors.WHITE;
		};

		// The proper color of a Memorial or a Feast is white.		
		var memorialFeastHandler = function( d ) {
			return liturgicalColors.WHITE;
		};

		// The proper color of a Memorial or a Feast for martyrs is red. 
		// The proper color for the Chair of Peter and the Conversion of St. Paul is white, although both St. Peter and St. Paul were martyrs.
		var martyrHandler = function ( d ) {
			return liturgicalColors.RED;
		};

		// Holy Thursday = white, Good Friday = red, Easter Vigil = White 
		var triduumHandler = function( d ) {
			if ( lodash.isEqual( d.literalKey, 'goodFriday' ) )
				return liturgicalColors.RED;
			else
				return liturgicalColors.WHITE;
		};

		// Monday - Wednesday of Holy Week is purple
		var holyWeekHandler = function ( d ) {
			return liturgicalColors.PURPLE;
		};

		// 	The proper color of a Memorial/Optional Memorial is the color of the season.		
		var optionalMemorialHandler = function ( d ) {
			if ( seasonRanges.adventRange.contains( d.moment ) || seasonRanges.lenternRange.contains( d.moment ) )
				return liturgicalColors.PURPLE;
			else if ( seasonRanges.earlierOrdinaryTime.contains( d.moment ) || seasonRanges.latterOrdinaryTime.contains( d.moment ) )
				return liturgicalColors.GREEN;
			else if ( seasonRanges.easterSeasonRange.contains( d.moment ) || seasonRanges.christmasOctaveRange.contains( d.moment ) )
				return liturgicalColors.WHITE;
			else 
				return liturgicalColors.WHITE
		};

		// The proper color for Feasts of the Lord is white except the Triumph of the Cross which is red.
		var feastOfTheLordHandler = function( d ) {
			if ( lodash.isEqual( d.literalKey, 'triumphOfTheCross' ) )
				return liturgicalColors.RED;
			else 
				return liturgicalColors.WHITE;
		};

		var fixedFeastHandler = function( d ) {
			return liturgicalColors.WHITE;
		};

		var feastApostleHandler = function( d ) {
			return liturgicalColors.RED;
		};

		var solemnityHandler = function( d ) {
			// Pentecost, Palm Sunday, and Peter and Paul is red
			if ( lodash.isEqual( d.literalKey, 'pentecostSunday') || lodash.isEqual( d.literalKey, 'peterAndPaulApostles' ) || lodash.isEqual( d.literalKey, 'palmSunday') || lodash.isEqual( d.literalKey, 'goodFriday') )
				return liturgicalColors.RED;
			
			// Gold vestments may be used on very festive occasions, such as Easter and Christmas.
			else if ( lodash.isEqual ( d.literalKey, 'easterSunday' ) || lodash.isEqual ( d.literalKey, 'christmas' ) )
				return liturgicalColors.GOLD;
			
			// The proper color for Solemnities is white.
			else
				return liturgicalColors.WHITE;
		};

		// 3rd Sunday of Advent and the 4th Sunday of Lent is rose or purple.
		// The proper color of the Advent and Lent seasons is purple
		var sundaysAndWeekdaysOfLentAAndAdventHandler = function( d ) {
			var key1 = 'the' + ordinalNumbers[2] + 'SundayOfAdvent',
				key2 = 'the' + ordinalNumbers[3] + 'SundayOfLent'
			if ( lodash.isEqual( d.literalKey, key1 )|| lodash.isEqual( d.literalKey, key2 ) ) 
				return liturgicalColors.ROSE;
			else 
				return liturgicalColors.PURPLE;
		};

		var commemorationHandler = function( d ) {
			return liturgicalColors.PURPLE;
		};

		var marked = false;
	 	lodash.map( dates, function( d, k, c ) {

	 		// Allocate liturgical colors
	 		if ( d.type ) {

				var color = {};

				switch( d.type.id ) {
					case types.SOLEMNITY.id:
						color = solemnityHandler( d );
						break;
					case types.FEAST_OF_THE_LORD.id:
						color = feastOfTheLordHandler( d );
						break;
					case types.FEAST.id:
						color = memorialFeastHandler( d );
						break;
					case types.FEAST_APOSTLE.id:
						color = feastApostleHandler( d );
						break;
					case types.WEEKDAY_FEAST.id:
						color = memorialFeastHandler( d );
						break;
					case types.FIXED_FEAST.id:
						color = fixedFeastHandler( d );
						break;
					case types.FEAST_MARTYR.id:
						color = martyrHandler( d );
						break;
					case types.TRIDUUM.id:
						color = triduumHandler( d );
						break;
					case types.HOLY_WEEK.id:
						color = holyWeekHandler( d );
						break;
					case types.SUNDAY_OF_EASTER.id:
						color = sundayWeekdayHandler( d );
						break;
					case types.SUNDAY_OF_LENT.id:
						color = sundaysAndWeekdaysOfLentAAndAdventHandler( d );
						break;
					case types.SUNDAY_OF_ADVENT.id:
						color = sundaysAndWeekdaysOfLentAAndAdventHandler( d );
						break;
					case types.MEMORIAL.id:
						color = memorialFeastHandler( d );
						break;
					case types.MEMORIAL_MARTYR.id:
						color = martyrHandler( d );
						break;
					case types.OPT_MEMORIAL.id:
						color = optionalMemorialHandler( d );
						break;
					case types.OPT_MEMORIAL_MARTYR.id:
						color = optionalMemorialHandler( d );
						break;
					case types.COMMEM.id:
						color = commemorationHandler( d );
						break;
					case types.WEEKDAY_OF_EASTER.id:
						color = sundayWeekdayHandler( d );
						break;
					case types.WEEKDAY_OF_LENT.id:
						color = sundaysAndWeekdaysOfLentAAndAdventHandler( d );
						break;
					case types.WEEKDAY_OF_ADVENT.id:
						color = sundaysAndWeekdaysOfLentAAndAdventHandler( d );
						break;
					case types.SUNDAY.id:
						color = sundayWeekdayHandler( d );
						break;
					case types.WEEKDAY.id:
						color = sundayWeekdayHandler( d );
						break;
					case types.WEEKDAY_OF_EPIPHANY.id:
						color = weekdayOfEpiphanyHandler( d );
						break;
					default:
						break;
				}

				d.color = color;
	 		}

	 		// Allocate season names
	 		if ( seasonRanges.earlierOrdinaryTime.contains( d.moment ) || seasonRanges.latterOrdinaryTime.contains( d.moment ) )
	 			d.data.season = categories.OT;
	 		else if ( seasonRanges.lenternRange.contains( d.moment ) )
	 			d.data.season = categories.LENT;
	 		else if ( seasonRanges.easterSeasonRange.contains( d.moment ) )
	 			d.data.season = categories.EASTER;
	 		else if ( seasonRanges.adventRange.contains( d.moment ) )
	 			d.data.season = categories.ADVENT;
	 		else if ( seasonRanges.christmasOctaveRange.contains( d.moment ) )
	 			d.data.season = categories.CHRISTMAS;
	 		else if ( seasonRanges.holyWeekRange.contains( d.moment ) )
	 			d.data.season = categories.HOLY_WEEK;
	 		else {
	 			if ( !lodash.isEqual( d.literalKey, 'baptismOfTheLord') && !marked )
	 				d.data.season = categories.CHRISTMAS;
	 			else
	 				marked = true;
	 		}
		});

		return dates;
	},

    getDatesByLiturgicalSeason: function( dates ) {
    	var result = { ordinaryTime: [], lent: [], easter: [], advent: [], christmastide: [], epiphany: [] };
    	lodash.map( dates, function( value, key ) {
    		switch( value.data.season ) {
    			case categories.OT:
    				result.ordinaryTime.push( value );
    				break;
    			case categories.LENT:
    				result.lent.push( value );
    				break;
    			case categories.EASTER:
    				result.easter.push( value );
    				break;
    			case categories.ADVENT:
    				result.advent.push( value );
    				break;
    			case categories.CHRISTMAS:
    				result.christmastide.push( value );
    				break;
    			case categories.EPIPHANY:
    				result.epiphany.push( value );
    				break;
    			default:
    				break;
    		}
    	});
    	return result;
    },

    getFeastsOfTheLord: function( dates ) {
    	return lodash.filter( dates, function( v, k ) {
    		return v.type.id === types.FEAST_OF_THE_LORD.id;
    	});
    },

    getMemorials: function( dates ) {
    	return lodash.filter( dates, function( v, k ) {
    		return v.type.id === types.MEMORIAL.id || v.type.id === types.MEMORIAL_MARTYR;
    	});
    },

    getOptionalMemorials: function( dates ) {
    	return lodash.filter( dates, function( v, k ) {
    		return v.type.id === types.OPT_MEMORIAL.id || v.type.id === types.OPT_MEMORIAL_MARTYR;
    	});
    },

    getCommemorations: function( dates ) {
    	return lodash.filter( dates, function( v, k ) {
    		return v.type.id === types.COMMEM.id;
    	});
    },

    getSolemnities: function( dates ) {
    	return lodash.filter( dates, function( v, k ) {
    		return v.type.id === types.SOLEMNITY.id;
    	});
    },

    getSundays: function( dates ) {
        return getDatesByDay( dates, 0 );
    },

    getMondays: function( dates ) {
        return getDatesByDay( dates, 1 );
    },

    getTuesdays: function( dates ) {
        return getDatesByDay( dates, 2 );
    },

    getWednesdays: function( dates ) {
        return getDatesByDay( dates, 3 );
    },

    getThursdays: function( dates ) {
        return getDatesByDay( dates, 4 );
    },

    getFridays: function( dates )  {
        return getDatesByDay( dates, 5 );
    },

    getSaturdays: function( dates ) {
        return getDatesByDay( dates, 6 );
    },

    getDaysGrouped: function( dates ) {
    	return getDaysGrouped( dates );
    },

    getJanuary: function( dates ) {
    	return getDatesByMonth( dates, 1 );
    },

    getFebruary: function( dates ) {
    	return getDatesByMonth( dates, 2 );
    },

    getMarch: function( dates ) {
    	return getDatesByMonth( dates, 3 );
    },

    getApril: function( dates ) {
    	return getDatesByMonth( dates, 4 );
    },

    getMay: function( dates ) {
    	return getDatesByMonth( dates, 5 );
    },

    getJune: function( dates ) {
    	return getDatesByMonth( dates, 6 );
    },

    getJuly: function( dates ) {
    	return getDatesByMonth( dates, 7 );
    },

    getAugust: function( dates ) {
    	return getDatesByMonth( dates, 8 );
    },

    getSeptember: function( dates ) {
    	return getDatesByMonth( dates, 9 );
    },

    getOctober: function( dates ) {
    	return getDatesByMonth( dates, 10 );
    },

    getNovember: function( dates ) {
    	return getDatesByMonth( dates, 11 );
    },

    getDecember: function( dates ) {
    	return getDatesByMonth( dates, 12 );
    }
};