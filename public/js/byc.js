"use strict";

function _calculateAge(birthday, onDate) {
    var ageDifMs = onDate - birthday.getTime();
    var ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function getProgram(age, day) {
    if (age === '6' || age === '7') {
        return '6-7-' + day;
    } else if (age === '8' || age === '9') {
        return '8-9-' + day;
    } else if (age === '10' || age === '11') {
        return '10-11-' + day;
    } else {
        return '12+';
    }
}

function sendRegistration(data) {
    var docId = data.first_name + '.' + data.last_name + ' (' + data.birthdate + ')';

    data.timestamp = firebase.firestore.FieldValue.serverTimestamp()

    var db = firebase.firestore();
    db.collection("registrations").doc(docId).set(
        data
    )
        .then(function () {
            console.log("Document successfully written!");

            // toggle form?            
            $('#confirmation-panel').show(300);
            $('#form').hide(300);
        })
        .catch(function (error) {
            console.error("Error writing document: ", error);
        });
}

function showForm() {
    $('#form').
    $('#confirmation-panel').hide(300);
    $('#form').show(300);
}

$(function () {
    $('#birthdate').on('change', function () {
        var birthday = new Date($('#birthdate').val());
        var age = _calculateAge(birthday, new Date(2018, 5, 1));
        $('#age_june_1').val(age);
        $('#age_june_1').change();

        if (age < 12) {
            $('.program-day-panel').show(300);
        }
        else {
            $('.program-day-panel').hide(300);
        }

        console.log('program', age === 6);

        $('#signature_participant_age').val(_calculateAge(birthday, new Date(Date.now())));
        $('#signature_participant_age').change();
    });

    $('#health_concerns').trigger('autoresize');

    $('#health_concerns').click(function () {
        if ($(this).is(':checked')) {
            $('#health_concerns_list').closest('div.row').hide(300);
            $('#health_concerns').val('Yes');
        }
        else {
            $('#health_concerns_list').closest('div.row').show(300);
            $('#health_concerns').val('No');
        }
    });

    $('#show-form-btn').click(function () {
        showForm();
    })
});