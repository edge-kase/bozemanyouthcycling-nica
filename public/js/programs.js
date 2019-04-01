'use strict';

var programs = [
    {
        id: "meadow-pedalers-monday",
        name: 'Meadow Pedalers',
        day: "Monday",
        grades: [1, 2],
        limit: 10,
        participants: [],
        fee: 175
    },
    {
        id: "meadow-pedalers-thursday",
        name: 'Meadow Pedalers',
        day: "Thursday",
        grades: [1, 2],
        limit: 30,
        participants: [],
        fee: 175
    },
    {
        id: "mountain-stompers-monday",
        name: 'Mountain Stompers',
        day: "Monday",
        ages: [8, 9],
        grades: [3, 4],
        limit: 30,
        participants: [],
        fee: 175
    },
    {
        id: "mountain-stompers-thursday",
        name: 'Mountain Stompers',
        day: "Thursday",
        grades: [3, 4],
        limit: 10,
        participants: [],
        fee: 175
    },
    {
        id: "alpine-rippers",
        name: 'Alpine Rippers',
        day: "Both",
        grades: [5],
        limit: 50,
        participants: [],
        fee: 275
    }
];

function getProgram(participant) {
    var program = programs.filter(function (program) {
        return program.grades.indexOf(parseInt(participant.grade)) > -1
            && (participant.grade >= 5 || program.day === participant.program_day);
    })[0];

    if (program === undefined) {
        console.log(`program not found for ${participant.grade} / ${participant.program_day}`);
    }

    return program || { id: "UNKNOWN", participants: [] };
}
