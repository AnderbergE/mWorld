function addForm (header, submitTo, items) {
	var form = '<div class="form-dialog"> \
		<form method="post" action="' + submitTo + '" id="form"> \
			<h2 class="form-header">' + header + '</h2>';

	for (var i = 0; i < items.length; i++) {
		form += '<div class="form-item">' + items[i] + '</div>';
	}

	form += '<div class="form-footer"> \
				<button class="simple-button semi-light form-cancel">Avbryt</button> \
				<button class="simple-button form-submit"><strong>Spara</strong></button> \
			</div> \
		</form> \
		</div>';
	form = $(form);
	$('body').append(form);
	form.find('input').first().focus();
	return form;
}

function addGroupForm () {
	addForm($(this).find('.card-header').text(),
		'addGroup',
		[
			'<label for="groupName">Namn:</label> \
				<input type="text" id="groupName" required />',
		]
	);
}

/* Action editGroup is sent from the form in group.html */

function removeGroupForm (ev) {
	/* Här borde det skrivas ut om spelaren är med i fler grupper. */
	addForm($(this).find('.card-header').text(),
		'removeGroup',
		[
			'<label>Namn:</label> \
				<select name="select" required> \
					<option value="id1">Ströbröd Dagis</option> \
					<option value="id2">Förskolan före sin tid</option> \
				</select>'
		]
	).find('select').prop('selectedIndex', -1);
}


function addPlayerForm () {
	addForm($(this).find('.card-header').text(),
		'addPlayer',
		[
			'<label for="firstName">Förnamn:</label> \
				<input type="text" name="firstName" id="firstName" required />',

			'<label for="lastName">Efternamn:</label> \
				<input type="text" name="lastName" id="lastName" required />'
		]
	);
}
function addExistingPlayerForm () {
	/* Här borde det skrivas ut om spelaren är med i fler grupper. */
	addForm($(this).find('.card-header').text(),
		'addExistingPlayer',
		[
			'<label>Namn:</label> \
				<select name="select" required> \
					<option value="id1">Björn Ukelele (Förskolan före sin tid)</option> \
					<option value="id2">Lionel Messi (Förskolan före sin tid)</option> \
				</select>',

			'<div class="smaller">Spelaren kommer att finnas kvar i befintlig grupp också.</div>'
		]
	).find('select').prop('selectedIndex', -1);
}

function editPlayerForm (playerId, first, last) {
	addForm('Spelarinformation',
		'editPlayer',
		[
			'<label for="firstName">Förnamn:</label> \
				<input type="text" name="firstName" id="firstName" value="' + first + '" required />',

			'<label for="lastName">Efternamn:</label> \
				<input type="text" name="lastName" id="lastName" value="' + last + '" required />',

			'<label>Agent:</label> \
				<input type="radio" name="agent" id="panda" class="hide form-radio" checked /> \
				<label for="panda" class="flat-button">Panders</label> \
				<input type="radio" name="agent" id="squid" class="hide form-radio" /> \
				<label for="squid" class="flat-button">Bläckvar</label>',

			'<label>Nivå:</label> \
				<select name="select"> \
					<option value="id1">Prickar i intervall 1-4</option> \
					<option value="id2" selected>Fingrar i intervall 1-4</option> \
					<option value="id3">Streck i intervall 1-4</option> \
				</select>'
		]
	).find('.form-header').after('<input type="text" id="playerId" value="' + playerId + '" class="hide" />');
}

function removePlayerForm () {
	/* Här borde det skrivas ut om spelaren är med i fler grupper. */
	addForm($(this).find('.card-header').text(),
		'removePlayer',
		[
			'<label>Namn:</label> \
				<select name="select" required> \
					<option value="id1">Erik Anderberg</option> \
					<option value="id2">Marcus Malmberg</option> \
					<option value="id2">Sebastian Gulz</option> \
				</select>',

			'<div class="smaller">Spelaren tas bort ur denna gruppen, men kan finnas kvar i andra.</div>'
		]
	).find('select').prop('selectedIndex', -1);
}


function addSupervisorForm () {
	addForm($(this).find('.card-header').text(),
		'addSupervisor',
		[
			'<label>Namn:</label> \
				<select name="select" required> \
					<option value="id1">Agneta Gulz</option> \
					<option value="id2">Magnus Haake</option> \
				</select>'
		]
	).find('select').prop('selectedIndex', -1);
}

function editSupervisorForm (supervisorId, first, last) {
	addForm('Min information',
		'editSupervisor',
		[
			'<label for="firstName">Förnamn:</label> \
				<input type="text" name="firstName" id="firstName" value="' + first + '" required />',

			'<label for="lastName">Efternamn:</label> \
				<input type="text" name="lastName" id="lastName" value="' + last + '" required />',
		]
	).find('.form-header').after('<input type="text" id="supervisorId" value="' + supervisorId + '" class="hide" />');
}

function removeSupervisorForm () {
	addForm($(this).find('.card-header').text(),
		'removeSupervisor',
		[
			'<label>Namn:</label> \
				<select name="select" required> \
					<option value="id1">Agneta Gulz</option> \
					<option value="id2">Magnus Haake</option> \
				</select>'
		]
	).find('select').prop('selectedIndex', -1);
}


window.onload = function () {
	/* General */
	$('body').on('click', '.form-cancel', function (ev) {
		ev.preventDefault();
		$(this).parents('.form-dialog').remove();
	});
	$('.current-supervisor').click(function () {
		var el = $(this); 
		editSupervisorForm(el.prop('id'), el.find('.first-name').text(), el.find('.last-name').text());
	});


	/* All groups' page: */
	$('#addGroup').click(addGroupForm);
	$('#removeGroup').click(removeGroupForm);


	/* A group's page: */
	$('#addPlayer').click(addPlayerForm);
	$('#addExistingPlayer').click(addExistingPlayerForm);
	$('#removePlayer').click(removePlayerForm);

	$('.player .clickable').click(function () {
		var el = $(this).parents('.player');
		editPlayerForm(el.prop('id'), el.find('.first-name').text(), el.find('.last-name').text());
	});

	$('#addSupervisor').click(addSupervisorForm);
	$('#removeSupervisor').click(removeSupervisorForm);
}