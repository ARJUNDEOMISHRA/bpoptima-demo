(function () {
  'use strict';

  // ── Stage expand/collapse ──
  document.querySelectorAll('.stage').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = btn.nextElementSibling;
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.classList.toggle('open', !isOpen);
    });
  });

  // ── Role toggle ──
  var roleButtons = document.querySelectorAll('.role-btn');

  function setRole(role) {
    document.body.setAttribute('data-role', role);
    roleButtons.forEach(function (b) {
      var active = b.getAttribute('data-role') === role;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    // Update role-copy text (intro & footer)
    document.querySelectorAll('.role-copy').forEach(function (el) {
      var text = el.getAttribute('data-' + role);
      if (text) el.textContent = text;
    });
  }

  roleButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setRole(btn.getAttribute('data-role'));
    });
  });

  // ── Replay animation ──
  var replayBtn = document.getElementById('replay-btn');
  var decisionMoment = document.getElementById('decision-moment');
  var allStageGroups = document.querySelectorAll('.stage-group');
  var isAnimating = false;

  function resetAnimation() {
    // Hide all stages and decision moment
    allStageGroups.forEach(function (sg) {
      sg.classList.add('anim-hidden');
      sg.classList.remove('anim-reveal');
      // Collapse any open panels
      var stageBtn = sg.querySelector('.stage');
      var panel = sg.querySelector('.stage-panel');
      if (stageBtn) stageBtn.setAttribute('aria-expanded', 'false');
      if (panel) panel.classList.remove('open');
    });
    decisionMoment.classList.remove('visible');
  }

  function runReplay() {
    if (isAnimating) return;
    isAnimating = true;
    replayBtn.disabled = true;
    replayBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/></svg> Running…';

    resetAnimation();

    // Reveal stages step by step (both cards simultaneously)
    var steps = [1, 2, 3, 4, 5];
    var delay = 600; // ms between each step

    steps.forEach(function (step, i) {
      setTimeout(function () {
        // Reveal this step in both cards
        document.querySelectorAll('.stage-group[data-step="' + step + '"]').forEach(function (sg) {
          sg.classList.remove('anim-hidden');
          sg.classList.add('anim-reveal');
        });
      }, delay * (i + 1));
    });

    // After all stages revealed, show decision moment
    setTimeout(function () {
      decisionMoment.classList.add('visible');
      // Auto-expand stage 3 (Rule Evaluated) in both cards to highlight the divergence
      document.querySelectorAll('.stage-group[data-step="3"] .stage').forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling.classList.add('open');
      });
    }, delay * (steps.length + 1));

    // Re-enable button
    setTimeout(function () {
      isAnimating = false;
      replayBtn.disabled = false;
      replayBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l4 3H2V2zM14 8A6 6 0 114 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Replay';
    }, delay * (steps.length + 2));
  }

  replayBtn.addEventListener('click', runReplay);

  // ── Double-click card header to expand/collapse all ──
  document.querySelectorAll('.claim-head').forEach(function (head) {
    head.addEventListener('dblclick', function () {
      var card = head.closest('.claim-card');
      var stages = card.querySelectorAll('.stage');
      var panels = card.querySelectorAll('.stage-panel');
      var allOpen = Array.from(stages).every(function (s) {
        return s.getAttribute('aria-expanded') === 'true';
      });
      stages.forEach(function (s) { s.setAttribute('aria-expanded', String(!allOpen)); });
      panels.forEach(function (p) { p.classList.toggle('open', !allOpen); });
    });
  });

  // ── Initialize ──
  function init() {
    setRole('cro');
    // Show decision moment by default (animation only hides/re-shows it)
    decisionMoment.classList.add('visible');
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Mini Pipeline Replay ──
  var miniBtn = document.getElementById('mini-replay-btn');
  var miniSteps = document.querySelectorAll('.mini-step');
  var miniArrows = document.querySelectorAll('.mini-arrow');
  var isMiniAnimating = false;

  function resetMini() {
    miniSteps.forEach(function (s) { s.className = 'mini-step'; });
    miniArrows.forEach(function (a) { a.classList.remove('visible'); });
  }

  function runMiniReplay() {
    if (isMiniAnimating) return;
    isMiniAnimating = true;
    miniBtn.disabled = true;
    resetMini();

    var stepDelay = 500;
    var totalSteps = miniSteps.length; // 6

    for (var i = 0; i < totalSteps; i++) {
      (function (idx) {
        setTimeout(function () {
          // Mark previous step as done
          if (idx > 0) {
            miniSteps[idx - 1].classList.remove('active');
            miniSteps[idx - 1].classList.add('done');
          }
          // Show arrow before this step (arrows are interleaved)
          if (idx > 0) {
            miniArrows[idx - 1].classList.add('visible');
          }
          // Mark current step as active
          miniSteps[idx].classList.add('active');
        }, stepDelay * idx);
      })(i);
    }

    // Final: mark last step as done
    setTimeout(function () {
      miniSteps[totalSteps - 1].classList.remove('active');
      miniSteps[totalSteps - 1].classList.add('done');
      isMiniAnimating = false;
      miniBtn.disabled = false;
    }, stepDelay * totalSteps);
  }

  if (miniBtn) {
    miniBtn.addEventListener('click', runMiniReplay);
  }

})();
