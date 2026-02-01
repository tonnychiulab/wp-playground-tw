const sidebarEl = document.getElementById('sidebar');
const sidebarOverlayEl = document.getElementById('sidebarOverlay');
const statusContainer = document.getElementById('statusContainer');
const welcomeState = document.getElementById('welcomeState');
const loadingState = document.getElementById('loadingState');
const loader = document.getElementById('loader');
const wpFrame = document.getElementById('wpFrame');

// System Check
document.addEventListener('DOMContentLoaded', () => {
    // Check Memory (Chrome/Edge only)
    if (navigator.deviceMemory) {
        const ram = navigator.deviceMemory;
        // console.log(`Device Memory: ~${ram}GB`);
        if (ram < 4) {
            const warningEl = document.getElementById('systemWarning');
            const ramSizeEl = document.getElementById('ramSize');
            if (warningEl && ramSizeEl) {
                ramSizeEl.innerText = ram;
                warningEl.classList.remove('hidden');
            }
        }
    }
});

function toggleSidebar() {
    sidebarEl.classList.toggle('-translate-x-full');
    sidebarOverlayEl.classList.toggle('hidden');
}

function openMobileSidebar() {
    sidebarEl.classList.remove('-translate-x-full');
    sidebarOverlayEl.classList.remove('hidden');
}

function toggleSidebarDesktop() {
    const expandBtn = document.getElementById('expandBtn');

    // Toggle margins/transform for desktop
    // We use negative margin to pull it off-screen
    sidebarEl.classList.toggle('md:-ml-80');

    // Toggle expand button visibility
    if (sidebarEl.classList.contains('md:-ml-80')) {
        expandBtn.classList.remove('hidden');
    } else {
        expandBtn.classList.add('hidden');
    }
}

function switchTab(tabName) {
    // Hide all contents
    document.querySelectorAll('.plugin-tab').forEach(el => el.classList.add('hidden'));
    // Deselect all buttons
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('text-blue-600', 'border-blue-600');
        el.classList.add('text-gray-500', 'border-transparent');
    });

    // Show selected content
    document.getElementById('tab-' + tabName).classList.remove('hidden');
    // Select button
    const btn = document.getElementById('tab-btn-' + tabName);
    btn.classList.remove('text-gray-500', 'border-transparent');
    btn.classList.add('text-blue-600', 'border-blue-600');
}

// Modern Base64 encoding
function encodeBase64(str) {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte),
    ).join("");
    return btoa(binString);
}

let isRunning = false;

// Presets Logic
function applyPreset(type) {
    // Uncheck all first
    document.querySelectorAll('.plugin-check').forEach(cb => cb.checked = false);
    // Uncheck themes (reset to default)
    document.querySelector('input[name="theme-radio"][value=""]').checked = true;

    // Apply Logic
    if (type === 'commerce') {
        const targets = ['woocommerce', 'wordpress-seo'];
        targets.forEach(v => {
            const el = document.querySelector(`.plugin-check[value="${v}"]`);
            if (el) el.checked = true;
        });
        // Switch to store tab to show effect
        switchTab('store');
    } else if (type === 'blog') {
        const targets = ['wordpress-seo', 'classic-editor'];
        targets.forEach(v => {
            const el = document.querySelector(`.plugin-check[value="${v}"]`);
            if (el) el.checked = true;
        });
        // Switch to featured tab
        switchTab('featured');
    }
    updatePluginCounts();
}

// Counter Logic
function updatePluginCounts() {
    ['featured', 'store', 'tools'].forEach(tab => {
        const container = document.getElementById('tab-' + tab);
        const count = container ? container.querySelectorAll('input:checked').length : 0;
        const badge = document.getElementById('count-' + tab);

        if (badge) {
            badge.innerText = count;
            if (count > 0) {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    });

    // Theme Counter (Special case, only if not default)
    const selectedTheme = document.querySelector('input[name="theme-radio"]:checked').value;
    const themeBadge = document.getElementById('count-themes');
    if (selectedTheme) {
        themeBadge.innerText = "1";
        themeBadge.classList.remove('hidden');
    } else {
        themeBadge.classList.add('hidden');
    }
}

// System Check & Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check Memory
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
        const warningEl = document.getElementById('systemWarning');
        const ramSizeEl = document.getElementById('ramSize');
        if (warningEl && ramSizeEl) {
            ramSizeEl.innerText = navigator.deviceMemory;
            warningEl.classList.remove('hidden');
        }
    }

    // Plugin Checkbox Listeners
    document.querySelectorAll('.plugin-check').forEach(cb => {
        cb.addEventListener('change', updatePluginCounts);
    });

    // Theme Radio Listeners
    document.querySelectorAll('.theme-check').forEach(cb => {
        cb.addEventListener('change', updatePluginCounts);
    });
});

// Blueprint Logic
function generateBlueprint() {
    const phpVersion = document.getElementById('phpVersion').value;
    const wpVersion = document.getElementById('wpVersion').value;
    const selectedPlugins = Array.from(document.querySelectorAll('.plugin-check:checked')).map(cb => cb.value);
    const selectedTheme = document.querySelector('input[name="theme-radio"]:checked').value;

    const steps = [
        {
            "step": "login",
            "username": "admin",
            "password": "password"
        }
    ];

    // Plugins
    selectedPlugins.forEach(plugin => {
        steps.push({
            "step": "installPlugin",
            "pluginData": {
                "resource": "wordpress.org/plugins",
                "slug": plugin
            }
        });
    });

    // Theme
    if (selectedTheme) {
        steps.push({
            "step": "installTheme",
            "themeData": {
                "resource": "wordpress.org/themes",
                "slug": selectedTheme
            }
        });
    }

    // PHP Setup
    const setupCode = `<?php
        require_once 'wp-load.php';
        update_option( 'timezone_string', 'Asia/Taipei' );
        update_option( 'gmt_offset', 8 );
    ?>`;

    steps.push({
        "step": "setSiteLanguage",
        "language": "zh_TW"
    });

    steps.push({
        "step": "runPHP",
        "code": setupCode
    });

    return {
        "landingPage": "/wp-admin/",
        "preferredVersions": {
            "php": phpVersion,
            "wp": wpVersion
        },
        "features": {
            "networking": true
        },
        "steps": steps
    };
}

function showBlueprint() {
    const blueprint = generateBlueprint();
    document.getElementById('blueprintCode').innerText = JSON.stringify(blueprint, null, 2);
    document.getElementById('blueprintModal').classList.remove('hidden');
}

// Export Logic
function getPlaygroundUrl(blueprint) {
    const blueprintJson = JSON.stringify(blueprint);
    const hash = encodeBase64(blueprintJson);
    return 'https://playground.wordpress.net/?v=' + Date.now() + '#' + hash;
}

function downloadBlueprint() {
    const blueprint = generateBlueprint();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blueprint, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "playground-blueprint.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function copyUrl() {
    const blueprint = generateBlueprint();
    const url = getPlaygroundUrl(blueprint);
    // Remove the cache busting query param for sharing to make it cleaner (optional, but better for sharing)
    const cleanUrl = url.replace(/\?v=\d+/, '');

    navigator.clipboard.writeText(cleanUrl).then(() => {
        alert('🌐 啟動連結已複製到剪貼簿！\n\n您可以將此連結傳給朋友，他們就能打開一模一樣的環境。');
    });
}

function shareLine() {
    const blueprint = generateBlueprint();
    const url = getPlaygroundUrl(blueprint).replace(/\?v=\d+/, '');

    // Line has a URL length limit, but we'll try our best.
    // Ideally we should use a URL shortener service, but that requires backend.

    const text = `我剛剛用 WP Playground TW 建立了一個 WordPress 測試站！\n\n包含外掛：${blueprint.steps.filter(s => s.step === 'installPlugin').map(s => s.pluginData.slug).join(', ') || '無'}\n\n點我啟動：${url}`;

    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank');
}

// Previously copyBlueprint - keeping it specific if needed, or rely on copyUrl/download
// Leaving generateBlueprint helper and launch logic below

function launchPlayground() {
    const selectedPlugins = Array.from(document.querySelectorAll('.plugin-check:checked'));
    const selectedTheme = document.querySelector('input[name="theme-radio"]:checked').value;

    // Safety check for restart
    if (isRunning) {
        let msg = "⚠️ 環境正在執行中\n\n重新啟動將會重置所有未儲存的變更。\n\n";

        let extras = [];
        if (selectedTheme) extras.push(`佈景: ${selectedTheme}`);
        if (selectedPlugins.length > 0) extras.push(`外掛: ` + selectedPlugins.map(cb => cb.closest('label').innerText.trim()).join(', '));

        if (extras.length > 0) {
            msg += "本次啟動將包含：\n👉 " + extras.join('\n👉 ') + "\n\n";
        } else {
            msg += "本次啟動將【不包含】任何額外外掛或主題。\n\n";
        }

        msg += "確定要重新啟動嗎？";

        const confirmRestart = confirm(msg);
        if (!confirmRestart) return;
    }

    // UI Updates - Lock Button
    const launchBtn = document.getElementById('launchBtn');
    const launchText = document.getElementById('launchText');
    const btnIcon = document.getElementById('btnIcon');
    const btnSpinner = document.getElementById('btnSpinner');

    launchBtn.disabled = true;
    btnIcon.classList.add('hidden');
    btnSpinner.classList.remove('hidden');

    if (isRunning) {
        launchText.innerText = "重啟中...";
    } else {
        launchText.innerText = "啟動中...";
    }

    // Sidebar Mobile check
    if (window.innerWidth < 768) {
        toggleSidebar();
    }

    // Show Overlay
    welcomeState.classList.add('hidden');
    loadingState.classList.remove('hidden');
    loader.classList.remove('hidden');
    wpFrame.classList.add('hidden');
    statusContainer.classList.remove('hidden');

    // Generate Blueprint & URL
    const blueprint = generateBlueprint();
    const blueprintJson = JSON.stringify(blueprint);
    const hash = encodeBase64(blueprintJson);
    const url = 'https://playground.wordpress.net/?v=' + Date.now() + '#' + hash;

    // Force iframe reset to ensure clean state
    wpFrame.src = 'about:blank';

    // Load new environment after a brief delay
    setTimeout(() => {
        wpFrame.src = url;
    }, 100);

    // Handle Load
    wpFrame.onload = function () {
        // Check if we can access the location (meaning we are still on same origin/about:blank)
        // If we CANT access it (CORS error), it means we successfully navigated to playground.wordpress.net
        let isLocal = false;
        try {
            isLocal = wpFrame.contentWindow.location.href === 'about:blank';
        } catch (e) {
            // SecurityError means Cross-Origin => Success! We are on the remote site.
            isLocal = false;
        }

        if (isLocal) {
            return; // Ignore about:blank load
        }

        // Give it a substantial delay to cover the white screen / bootloader phase
        // 3 seconds is usually enough for the basic bootloader to appear
        setTimeout(() => {
            statusContainer.classList.add('hidden');
            wpFrame.classList.remove('hidden');

            // Re-enable button and Set Running State
            isRunning = true;
            launchBtn.disabled = false;
            btnIcon.classList.remove('hidden');
            btnSpinner.classList.add('hidden');

            // Switch to Restart Mode
            launchBtn.classList.remove('bg-blue-700', 'hover:bg-blue-800', 'focus:ring-blue-300');
            launchBtn.classList.add('bg-orange-600', 'hover:bg-orange-700', 'focus:ring-orange-300');
            launchText.innerText = "重新啟動環境";

        }, 3000);
    };

    // Safety Fallback: Removing loading mask after 20 seconds if nothing happens
    // (In case of network timeout where onload doesn't trigger properly)
    setTimeout(() => {
        if (!statusContainer.classList.contains('hidden')) {
            statusContainer.classList.add('hidden');
            wpFrame.classList.remove('hidden');
            launchBtn.disabled = false;
            btnIcon.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
        }
    }, 20000);
}
