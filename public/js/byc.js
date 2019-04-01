"use strict";

Date.prototype.formatMMDDYYYY = function (separator) {
    if (separator === undefined) {
        separator = '/';
    }
    return (this.getMonth() + 1) +
        separator + this.getDate() +
        separator + this.getFullYear();
};

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

function calculateAge(birthday, onDate) {
    var ageDifMs = onDate - birthday.getTime();
    var ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function setParticipantData(data, participantGroup) {
    var index = $(participantGroup).data("participant-number");
    $(participantGroup).find("input, textarea").map(function (i, e) {
        var name = e.name.replace("__" + index, "");
        if (name.length > 0) { //todo shouldn't happen but is
            data[name] = e.value;
        } else {
            console.log("null name: " + e.name);
        }
    });

    if ($("#gender_male__" + index).is(':checked')) {
        data.gender = 'Male';
    } else if ($("#gender_female__" + index).is(':checked')) {
        data.gender = 'Female';
    }

    if ($("#program_day_monday__" + index).is(':checked')) {
        data.program_day = 'Monday';
    } else if ($("#program_day_thursday__" + index).is(':checked')) {
        data.program_day = 'Thursday';
    } else if ($("#program_day_both__" + index).is(':checked')) {
        data.program_day = 'Both';
    }
}

function wireParticipantEvents($participant) {
    var participantNumber = $participant.data("participant-number");

    if (participantNumber === 1) {
        $("[data-remove-participant='1']").remove();
    }

    $("[data-remove-participant]").click(function (e) {
        $(e.target).closest(".participant").remove();
        $('.participant').each(function (i, v) {
            $(v).find('.number-badge').text(i + 1);
        });
    });

    // $participant.find('.datepicker').datepicker({
    //     autoClose: true,
    //     minDate: new Date(2000, 0, 1),
    //     maxDate: new Date((new Date().getFullYear() - 6), 4, 31),
    //     //yearRange: [1999, 2013],
    //     format: 'mmm d, yyyy',
    //     clear: 'Clear',
    //     close: 'Ok'
    // });

    var $birthdate = $participant.find('[id=birthdate__' + participantNumber + ']');
    $birthdate.on('change', function (e) {
        var $birthdateElement = $(e.target);
        var birthday = new Date($birthdateElement.val());

        var age = isValidDate(birthday) ? calculateAge(birthday, new Date(2019, 5, 1)) : -1;
        var ageElement = $('#age_june_1__' + participantNumber);

        if (age >= 6) {
            ageElement.val(age);
            ageElement.next('label').addClass('active');
            $birthdateElement.removeClass('invalid');
        } else {
            ageElement.val('Invalid Birthdate');
            $birthdateElement.addClass('invalid');
        }
    });

    $birthdate.keypress(function (e) {
        var char = String.fromCharCode(e.which);
        if (!char.match(/[0-9\/]/)) {
            e.preventDefault();
        }
    });

    $participant.find("[id=grade__" + participantNumber + "]").on('change', function (e) {
        var grade = $(e.target).val();
        if (grade < 5) {
            $('#program_day_monday__' + participantNumber).prop('disabled', false)
            $('#program_day_thursday__' + participantNumber).prop('disabled', false);
            $('#program_day_both__' + participantNumber).prop('disabled', true);
        } else {
            $('#program_day_monday__' + participantNumber).prop('disabled', true)
            $('#program_day_thursday__' + participantNumber).prop('disabled', true);
            $('#program_day_both__' + participantNumber).prop('disabled', false);
            $('input:radio#program_day_both__' + participantNumber).prop('checked', true);
            $("input[name=program_day__" + participantNumber + "]").change();
        }
    });

    $("input[name=program_day__" + participantNumber + "]").change(function () {
        var data = {};
        setParticipantData(data, $(this).closest('.participant'));

        var program = getProgram(data);
        $('#program__' + participantNumber).val(program.id);

        var waitlistAlert = $('[data-participant-number=' + participantNumber + '] .waitlist-program-alert');
        if (waitlist.indexOf(program.id) > -1) {
            waitlistAlert.show(500);
        } else if ($('.waitlist-alert')) {
            waitlistAlert.hide(500);
        }
    });
}

function getDocId(data) {
    return data.first_name + '.' + data.last_name + ' (' + new Date(data.birthdate).formatMMDDYYYY('-') + ')';
}

function sendRegistration(data, callback) {
    var docId = getDocId(data);

    data.timestamp = firebase.firestore.FieldValue.serverTimestamp();

    var db = firebase.firestore();

    db.collection("registrations").doc(docId).set(
        data
    )
        .then(function () {
            console.log("Document successfully written! " + docId);

            var program = getProgram(data);

            var index = program.participants.findIndex(function (value, index) {
                return getDocId(value) === docId;
            });

            var displayAmount;
            var amount = 0;
            if (index < program.limit) {
                amount = program.fee;
                var totalAmount = parseInt($('#total_amount').text()) + program.fee;
                $('#total_amount').text(totalAmount);
                displayAmount = "$" + amount;
            } else {
                displayAmount = "WAIT LIST";
            }

            $('table#result tbody').append("<tr><td>"
                + data.first_name + "</td><td>"
                + program.name + " - " + program.day + "</td><td>"
                + displayAmount + "</td></tr>");

            callback(docId, amount);
        })
        .catch(function (error) {
            console.error("Error writing document: ", error);
        });
}

function addParticipant() {
    var addParticipantBtn = $("#add-participant-btn");
    var participantCount = addParticipantBtn.data("participant-count");
    var newParticipantCount = participantCount + 1;
    addParticipantBtn.data("participant-count", newParticipantCount);

    var content = `
    <input type="hidden" id="program__PARTICIPANT_COUNT" />
    
    <div class="participant" data-participant-number="PARTICIPANT_COUNT">
    <div class="btn-floating btn number-badge">${$('.participant').length + 1}</div>
    <div class="btn-floating btn right" data-remove-participant="PARTICIPANT_COUNT" title="Remove this participant">
        <i class="material-icons red">remove</i>
    </div>
    <div class="row">
      <div class="input-field col s12 m6">
        <input id="first_name__PARTICIPANT_COUNT" name="first_name__PARTICIPANT_COUNT" type="text" class="validate" required="" aria-required="true">
        <label for="first_name__PARTICIPANT_COUNT">First Name</label>
      </div>
      <div class="input-field col s12 m6">
        <input id="last_name__PARTICIPANT_COUNT" name="last_name__PARTICIPANT_COUNT" type="text" class="validate" required="" aria-required="true">
        <label for="last_name__PARTICIPANT_COUNT">Last Name</label>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s4">
        <input type="text" class="datepicker" placeholder="mm/dd/yyyy" id="birthdate__PARTICIPANT_COUNT" name="birthdate__PARTICIPANT_COUNT">
        <label for="birthdate__PARTICIPANT_COUNT" class="active">Birthdate</label>
      </div>
      <div class="input-field col s4">
        <input type="text" class="text" id="age_june_1__PARTICIPANT_COUNT" name="age_june_1__PARTICIPANT_COUNT" readonly="true">
        <label for="age_june_1__PARTICIPANT_COUNT">Age (June 1)</label>
      </div>
      <div class="col s4">
        <label for="gender__PARTICIPANT_COUNT">Gender</label>
        <p>
          <label>
            <input name="gender__PARTICIPANT_COUNT" type="radio" id="gender_female__PARTICIPANT_COUNT" class="with-gap" class="validate" required=""
            aria-required="true" />
            <span>Female</span>
          </label>
          <label>
          <input name="gender__PARTICIPANT_COUNT" type="radio" id="gender_male__PARTICIPANT_COUNT" class="with-gap" class="validate" required=""
            aria-required="true" />
            <span>Male</span>
          </label>
        </p>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s12 m6">
        <input id="school__PARTICIPANT_COUNT" name="school__PARTICIPANT_COUNT" type="text" class="validate" required="" aria-required="true">
        <label for="school__PARTICIPANT_COUNT">School</label>
      </div>
      <div class="input-field col s12 m6">
        <input id="grade__PARTICIPANT_COUNT" name="grade__PARTICIPANT_COUNT" type="number" class="validate" required="" aria-required="true" min="1" max="5">
        <label for="grade__PARTICIPANT_COUNT">Grade (Fall 2019)</label>
      </div>
    </div>
    <div class="row program-day-panel">
      <div class="col s12">
        <label for="program_day__PARTICIPANT_COUNT">Program Day</label>
        <p>
        <label>
          <input name="program_day__PARTICIPANT_COUNT" type="radio" id="program_day_monday__PARTICIPANT_COUNT" class="with-gap" class="validate"
            required="" aria-required="true" disabled />
            <span>Monday</span></label>
        <label>
          <input name="program_day__PARTICIPANT_COUNT" type="radio" id="program_day_thursday__PARTICIPANT_COUNT" class="with-gap" class="validate"
            required="" aria-required="true" disabled />
          <span>Thursday</span></label>
        <label>
          <input name="program_day__PARTICIPANT_COUNT" type="radio" id="program_day_both__PARTICIPANT_COUNT" class="with-gap" class="validate" required=""
            aria-required="true" disabled />
          <span>Monday and Thursday (5th Grade)</span></label>
        </p>
        <div class="waitlist-alert waitlist-program-alert">This program currently full. Please complete the form to
          be added to the wait list.</div>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s12">
        <textarea id="health_concerns__PARTICIPANT_COUNT" name="health_concerns__PARTICIPANT_COUNT" class="materialize-textarea"></textarea>
        <label for="health_concerns__PARTICIPANT_COUNT">Allergies or health concerns</label>
      </div>
    </div>

    </div>`;

    content = content.replace(/PARTICIPANT_COUNT/g, newParticipantCount);

    addParticipantBtn.before(content);

    wireParticipantEvents($("[data-participant-number='" + newParticipantCount + "']"));
}

function showForm() {
    $('#waitlist-panel').hide(300);
    $('#form').show(300);
}

$(function () {
    $('#add-participant-btn').click(function () {
        addParticipant();
    });

    $('#show-form-btn').click(function () {
        showForm();
    });

    $('#add-participant-btn').click();
});

var waitlist = [];

function initWaitListWatch(db) {
    db.collection("registrations")
        .orderBy("timestamp")
        .onSnapshot(function (querySnapshot) {
            programs.forEach(function (program, i) {
                program.participants = [];
            });

            querySnapshot.forEach(function (doc) {
                var participant = doc.data();
                participant.id = doc.id;
                var program = getProgram(participant);
                program.participants.push(participant);
            });

            waitlist = [];
            programs.forEach(function (program) {
                if (program.participants.length >= program.limit) {
                    waitlist.push(
                        program.id
                    );

                    if ($('[id^=program__]').val() === program.id) {
                        $('.waitlist-program-alert').show(500);
                    }
                }
            });

            if (waitlist.length === programs.length) {
                $('.waitlist-header-alert').show(500);
            }
        });
}