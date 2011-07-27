"use strict";

function onReady() {
	// prevent selection
	document.onselectstart = function() {
		return false;
	};

	Grid.init(document.getElementById("grid"));

	$("#helpdialog").dialog({
		autoOpen: false,
		modal: true,
		draggable: false,
		resizable: false,
		width: "400",
	});
	$("#help").button({
		text: false,
		label: "Help [H]",
		icons: {
			primary: "ui-icon-info"
		}
	})
	.click( function() {
		$("#helpdialog").dialog("open");
	});

	$("#clear").button({
		text: false,
		label: "Clear Grid [C]",
		icons: {
			primary: "ui-icon-document"
		},
	})
	.click( function() {
		AutomatonManager.halt();
		if (!AutomatonManager.pattern) {
			AutomatonManager.pattern = Automaton.toPattern();
		}
		Automaton.clear();
		Grid.setZoom(Grid.getZoom(Grid.DEFAULT_SCALE), true);
		Grid.recenter();
	});

	$("#reset").button({
		text: false,
		label: "Reset To Last Edit [R]",
		icons: {
			primary: "ui-icon-arrowreturnthick-1-w",
		},
	})
	.click( function() {
		AutomatonManager.reset();
		Grid.fitPattern();
		Grid.paint();
	});

	var playOptions = {
		label: "Play [Space]",
		icons: {
			primary: "ui-icon-play",
		},
	};
	var pauseOptions = {
		label: "Pause [Space]",
		icons: {
			primary: "ui-icon-pause",
		},
	};
	$("#play").button({
		text: false,
	})
	.click( function() {
		AutomatonManager.toggle();
	});

	$("#play").button("option", playOptions);

	$("#nextgen").button({
		text: false,
		label: "Next Generation [G]",
		icons: {
			primary: "ui-icon-arrow-1-e",
		},
	})
	.click( function() {
		AutomatonManager.step(1);
	});

	var getNextStepLabel = function() {
		return "Step Over " + AutomatonManager.getSteps() + " Generation(s) [S]";
	}

	$("#nextstep").button({
		text: false,
		label: getNextStepLabel(),
		icons: {
			primary: "ui-icon-arrowthick-1-e",
		},
	})
	.click( function() {
		AutomatonManager.step();
	});

	$("#rungroup").buttonset();

	$("#gridlines")[0].checked = Grid.visibleGridLines;
	$("#gridlines").button({
		text: false,
		label: "Toggle Grid Lines [L]",
		icons: {
			primary: "ui-icon-calculator"
		},
	})
	.click( function() {
		Grid.toggleGridLines();
	});

	$("#fitpattern").button({
		text: false,
		label: "Fit Pattern To Window [F]",
		icons: {
			primary: "ui-icon-arrow-4-diag"
		},
	})
	.click( function() {
		Grid.fitPattern(true);
		Grid.paint();
	});

	$("#autofit")[0].checked = Grid.autoFit;
	$("#autofit").button({
		text: false,
		label: "Toggle Auto-Fit [A]",
		icons: {
			primary: "ui-icon-check"
		},
	})
	.click( function() {
		Grid.autoFit = !Grid.autoFit;
	});

	$("#fitgroup").buttonset();

	$("#scale")[0].title = "Scale [click to reset]";
	$("#scale").button({
		label: Grid.getScaleString(),
	})
	.click( function() {
		Grid.setZoom(Grid.getZoom(Grid.DEFAULT_SCALE), true);
	});

	$("#zoomin").parent().buttonset();
	$("#zoomslider").slider({
		min: 0,
		max: Grid.getMaxZoom(),
		value: Grid.getZoom(),
		slide: function(event, ui) {
			Grid.setZoom(ui.value);
		},

	});
	$("#zoomin").button({
		text: false,
		label: "Zoom In [Ctrl-Up]",
		icons: {
			primary: "ui-icon-zoomin"
		},
	})
	.click( function() {
		Grid.zoom(1);
	});

	$("#zoomout").button({
		text: false,
		label: "Zoom Out [Ctrl-Down]",
		icons: {
			primary: "ui-icon-zoomout"
		},
	})
	.click( function() {
		Grid.zoom(-1);
	});

	// speed
	$("#speed")[0].title = "Speed [click to reset]";
	$("#speed").parent().buttonset();
	$("#speed").button({
		label: AutomatonManager.getSpeedString(),
	})
	.click( function() {
		AutomatonManager.setSpeed(AutomatonManager.DEFAULT_SPEED);
	});

	$("#slower").button({
		text: false,
		label: "Slower [Ctrl-Left]",
		icons: {
			primary: "ui-icon-minus"
		},
	})
	.click( function() {
		AutomatonManager.speedDown();
	});

	$("#faster").button({
		text: false,
		label: "Faster [Ctrl-Right]",
		icons: {
			primary: "ui-icon-plus",
		},
	})
	.click( function() {
		AutomatonManager.speedUp();
	})

	$("#speedslider").slider({
		min: AutomatonManager.MIN_SPEED,
		max: AutomatonManager.MAX_SPEED,
		value: AutomatonManager.speed,
		slide: function(event, ui) {
			AutomatonManager.setSpeed(ui.value);
		}

	});

	Rules.list.forEach( function(r, index) {
		$("#rulelist").append(
		"<li><a href='#' " +
		"rule-index='" + index + "' " +
		">" + r.toString() + "</a></li>"
		);
	});

	$("#rule")[0].title = "Automaton Rule (click to edit)";
	$("#rule").button({
		label: Automaton.rule.toString(),
	});
	$("#ruleselect").button({
		text: false,
		label: "Select A Rule",
		icons: {
			primary: "ui-icon-triangle-1-s",
		},
	})
	$("#rulelist").menu({
		select: function(e, ui) {
			$("#rule").button("option", "label", ui.item.text());
			var ruleIndex = ui.item.children(0).attr("rule-index");
			Automaton.setRule(Rules.list[ruleIndex]);
			document.activeElement.blur();
		},

	})
	.popup().parent().buttonset({
		items: "button",
	});

	var population = $("#population")[0];
	var generation = $("#generation")[0];
	var updateStats = function() {
		population.innerHTML = Automaton.size;
		generation.innerHTML = Automaton.generation;
	};

	updateStats();

	// event binding
	Automaton.bind("step", updateStats);
	Automaton.bind("edit", updateStats);

	Grid.bind("autofit", function() {
		$("#autofit")[0].checked = Grid.autoFit;
		$("#autofit").button("refresh");
	});

	Grid.bind("zoom", function() {
		$("#zoomslider").slider("value", Grid.getZoom());
		$("#scale").button("option", "label", Grid.getScaleString());
	});

	AutomatonManager.bind('speed', function() {
		$("#speedslider").slider("value", AutomatonManager.speed);
		$("#speed").button("option", "label", AutomatonManager.getSpeedString());
		$("#nextstep").button("option", "label", getNextStepLabel());
		$("#play").button("option", AutomatonManager.paused ? playOptions : pauseOptions);
	});

	AutomatonManager.bind('paused', function() {
		$("#play").button("option", AutomatonManager.paused ? playOptions : pauseOptions);
		if (AutomatonManager.paused) {
			latency.innerHTML = "";
		}
	});

	var latency = $("#latency")[0];
	AutomatonManager.bind('tick', function() {
		latency.innerHTML = new Number(AutomatonManager.getMovingAverage()).toFixed(1) + "ms";
	});

	// keyboard setup
	(function() {
		var KEY = {
			CTRL: 17,
			SPACE: 32,
			LEFT: 37,
			UP: 38,
			RIGHT: 39,
			DOWN: 40,
			A: 65,
			C: 67,
			F: 70,
			G: 71,
			H: 72,
			L: 76,
			R: 82,
			S: 83,
		};

		var velocity = (Grid.scale > 0 ? Grid.scale : 1);
		var accelaration = 1.5;

		$(document).keydown( function(event) {
			var delta = Math.floor(velocity += accelaration);
			if (!event.ctrlKey) {
				switch (event.which) {
					case KEY.H:
						$("#help").click();
						break;
					case KEY.C:
						$("#clear").click();
						break;
					case KEY.SPACE:
						$("#play").click();
						break;
					case KEY.S:
						$("#nextstep").click();
						break;
					case KEY.G:
						$("#nextgen").click();
						break;
					case KEY.L:
						$("#gridlines").click();
						break;
					case KEY.A:
						$("#autofit").click();
						break;
					case KEY.F:
						$("#fitpattern").click();
						break;
					case KEY.R:
						$("#reset").click();
						break;
					case KEY.LEFT:
						Grid.pan(delta, 0);
						break;
					case KEY.RIGHT:
						Grid.pan(-delta, 0);
						break;
					case KEY.UP:
						Grid.pan(0, delta);
						break;
					case KEY.DOWN:
						Grid.pan(0, -delta);
						break;
				}
			} else {
				// ctrl pressed
				switch (event.which) {
					case KEY.LEFT:
						AutomatonManager.speedDown();
						break;
					case KEY.RIGHT:
						AutomatonManager.speedUp();
						break;
					case KEY.UP:
						Grid.zoom(1)
						break;
					case KEY.DOWN:
						Grid.zoom(-1);
						break;
				}
			};
		});

		$(document).keyup( function() {
			velocity = Grid.scale > 0 ? Grid.scale : 1;
		});

	})();

	// REMOVE ME
	$.get("patterns/AQUA25.LIF", function(data) {
		Automaton.addPattern(Patterns.loadLIF(data).positions);
		Grid.fitPattern();
		Grid.paint();
	});

}