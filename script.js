
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let isRunning = false;

function initApp() {
    // 1. Initial Checks
    checkSystemMemory();

    // 2. Bind Event Listeners
    bindSidebarEvents();
    bindPresetEvents();
    bindTabEvents();
    bindLauncherEvents();
    bindBlueprintEvents();

    // 3. Initialize UI State if needed
    updatePluginCounts();
}

/**
 * System Memory Check
 */
function checkSystemMemory() {
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
        const warningEl = document.getElementById('systemWarning');
        const ramSizeEl = document.getElementById('ramSize');
        if (warningEl && ramSizeEl) {
            ramSizeEl.innerText = navigator.deviceMemory;
            warningEl.classList.remove('hidden');
        }
    }
}

/**
 * Sidebar Interaction (Mobile & Desktop)
 */
function bindSidebarEvents() {
    const sidebarEl = document.getElementById('sidebar');
    const sidebarOverlayEl = document.getElementById('sidebarOverlay');
    const expandBtn = document.getElementById('expandBtn');

    // Mobile Toggle
    const btnMobileToggle = document.getElementById('btnMobileToggle');
    const btnOpenMobileSidebar = document.getElementById('btnOpenMobileSidebar');

    const toggleMobile = () => {
        sidebarEl.classList.toggle('-translate-x-full');
        sidebarOverlayEl.classList.toggle('hidden');
    };

    if (btnMobileToggle) btnMobileToggle.addEventListener('click', toggleMobile);
    if (btnOpenMobileSidebar) btnOpenMobileSidebar.addEventListener('click', () => {
        sidebarEl.classList.remove('-translate-x-full');
        sidebarOverlayEl.classList.remove('hidden');
    });
    if (sidebarOverlayEl) sidebarOverlayEl.addEventListener('click', toggleMobile);

    // Desktop Collapse
    const btnCollapseDesktop = document.getElementById('btnCollapseDesktop');

    const toggleDesktop = () => {
        // Toggle negative margin to pull off-screen
        sidebarEl.classList.toggle('md:-ml-80');

        // Toggle expand button visibility
        if (sidebarEl.classList.contains('md:-ml-80')) {
            expandBtn.classList.remove('hidden');
        } else {
            expandBtn.classList.add('hidden');
        }
    };

    if (btnCollapseDesktop) btnCollapseDesktop.addEventListener('click', toggleDesktop);
    if (expandBtn) expandBtn.addEventListener('click', toggleDesktop);
}

/**
 * Tab Switching Logic
 */
function bindTabEvents() {
    const tabs = document.querySelectorAll('[data-action="switch-tab"]');

    tabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });

    // Also bind change events for UpdatePluginCounts
    document.querySelectorAll('.plugin-check, .theme-check').forEach(cb => {
        cb.addEventListener('change', updatePluginCounts);
    });
}

function switchTab(tabName) {
    // Hide all contents
    document.querySelectorAll('.plugin-tab').forEach(el => el.classList.add('hidden'));

    // Reset all buttons style
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('text-blue-600', 'border-blue-600');
        el.classList.add('text-gray-500', 'border-transparent');
    });

    // Show selected content
    const targetContent = document.getElementById('tab-' + tabName);
    if (targetContent) targetContent.classList.remove('hidden');

    // Highlight button
    const targetBtn = document.getElementById('tab-btn-' + tabName);
    if (targetBtn) {
        targetBtn.classList.remove('text-gray-500', 'border-transparent');
        targetBtn.classList.add('text-blue-600', 'border-blue-600');
    }
}

/**
 * Preset Logic
 */
function bindPresetEvents() {
    const presetBtns = document.querySelectorAll('[data-action="apply-preset"]');

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            applyPreset(btn.dataset.preset);
        });
    });
}

function applyPreset(type) {
    // Uncheck all first
    document.querySelectorAll('.plugin-check').forEach(cb => cb.checked = false);
    // Uncheck themes (reset to default)
    const defaultTheme = document.querySelector('input[name="theme-radio"][value=""]');
    if (defaultTheme) defaultTheme.checked = true;

    // Apply Logic
    if (type === 'commerce') {
        const targets = ['woocommerce', 'wordpress-seo'];
        targets.forEach(v => {
            const el = document.querySelector(`.plugin-check[value="${v}"]`);
            if (el) el.checked = true;
        });
        switchTab('store');
    } else if (type === 'blog') {
        const targets = ['wordpress-seo', 'classic-editor'];
        targets.forEach(v => {
            const el = document.querySelector(`.plugin-check[value="${v}"]`);
            if (el) el.checked = true;
        });
        switchTab('featured');
    }
    updatePluginCounts();
}

/**
 * Counter Logic
 */
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

    // Theme Counter
    const selectedTheme = document.querySelector('input[name="theme-radio"]:checked')?.value;
    const themeBadge = document.getElementById('count-themes');
    if (themeBadge) {
        if (selectedTheme) {
            themeBadge.innerText = "1";
            themeBadge.classList.remove('hidden');
        } else {
            themeBadge.classList.add('hidden');
        }
    }
}

/**
 * Launcher & Error Handling
 */
function bindLauncherEvents() {
    const launchBtn = document.getElementById('launchBtn');
    if (launchBtn) {
        launchBtn.addEventListener('click', launchPlayground);
    }

    const btnRetry = document.getElementById('btnRetry');
    if (btnRetry) {
        btnRetry.addEventListener('click', () => {
            // Reset UI states to ready-to-launch and try again
            document.getElementById('errorState').classList.add('hidden');
            launchPlayground();
        });
    }

    const btnForceReload = document.getElementById('btnForceReload');
    if (btnForceReload) {
        btnForceReload.addEventListener('click', () => {
            location.reload();
        });
    }
}

function launchPlayground() {
    const selectedPlugins = Array.from(document.querySelectorAll('.plugin-check:checked'));
    const selectedTheme = document.querySelector('input[name="theme-radio"]:checked')?.value;

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

        if (!confirm(msg)) return;
    }

    // UI Elements
    const launchBtn = document.getElementById('launchBtn');
    const launchText = document.getElementById('launchText');
    const btnIcon = document.getElementById('btnIcon');
    const btnSpinner = document.getElementById('btnSpinner');

    const welcomeState = document.getElementById('welcomeState');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const statusContainer = document.getElementById('statusContainer');
    const loader = document.getElementById('loader');
    const wpFrame = document.getElementById('wpFrame');

    // Reset Error State
    if (errorState) errorState.classList.add('hidden');

    // Lock Button
    launchBtn.disabled = true;
    btnIcon.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    launchText.innerText = isRunning ? "重啟中..." : "啟動中...";

    // Mobile Sidebar check
    if (window.innerWidth < 768) {
        const sidebarEl = document.getElementById('sidebar');
        const sidebarOverlayEl = document.getElementById('sidebarOverlay');
        sidebarEl.classList.add('-translate-x-full');
        sidebarOverlayEl.classList.add('hidden');
    }

    // Show Overlay
    welcomeState.classList.add('hidden');
    loadingState.classList.remove('hidden');
    if (loader) loader.classList.remove('hidden');
    wpFrame.classList.add('hidden');
    statusContainer.classList.remove('hidden');

    // Generate Blueprint & URL
    const blueprint = generateBlueprint();
    const blueprintJson = JSON.stringify(blueprint);
    const hash = encodeBase64(blueprintJson);
    const url = 'https://playground.wordpress.net/?v=' + Date.now() + '#' + hash;

    // Force iframe reset
    wpFrame.src = 'about:blank';

    setTimeout(() => {
        wpFrame.src = url;
    }, 100);

    // Timeout Logic
    const timeoutId = setTimeout(() => {
        if (!statusContainer.classList.contains('hidden') && loadingState.classList.contains('hidden') === false) {
            // Still loading after 20s
            loadingState.classList.add('hidden');
            if (loader) loader.classList.add('hidden');
            if (errorState) errorState.classList.remove('hidden');

            // Reset Button State
            launchBtn.disabled = false;
            btnIcon.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
            launchText.innerText = "啟動環境";
        }
    }, 20000);

    wpFrame.onload = function () {
        // Simple cross-origin check
        let isLocal = false;
        try {
            isLocal = wpFrame.contentWindow.location.href === 'about:blank';
        } catch (e) {
            isLocal = false; // CORS Error = Success
        }

        if (isLocal) return;

        // Clear timeout if successful load
        clearTimeout(timeoutId);

        setTimeout(() => {
            statusContainer.classList.add('hidden');
            wpFrame.classList.remove('hidden');

            // Set Running State
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
}

/**
 * Blueprint & Sharing
 */
function bindBlueprintEvents() {
    // Show Modal
    const btnShow = document.getElementById('btnShowBlueprint');
    const modal = document.getElementById('blueprintModal');
    const codeBlock = document.getElementById('blueprintCode');

    if (btnShow && modal) {
        btnShow.addEventListener('click', () => {
            const blueprint = generateBlueprint();
            codeBlock.innerText = JSON.stringify(blueprint, null, 2);
            modal.classList.remove('hidden');
        });
    }

    // Close Modal (Multiple buttons)
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (modal) modal.classList.add('hidden');
        });
    });

    // Share Actions
    const btnShareLine = document.getElementById('btnShareLine');
    if (btnShareLine) {
        btnShareLine.addEventListener('click', () => {
            const blueprint = generateBlueprint();
            const url = getPlaygroundUrl(blueprint).replace(/\?v=\d+/, '');
            const text = `我剛剛用 WP Playground TW 建立了一個 WordPress 測試站！\n\n包含外掛：${blueprint.steps.filter(s => s.step === 'installPlugin').map(s => s.pluginData.slug).join(', ') || '無'}\n\n點我啟動：${url}`;
            const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
            window.open(lineUrl, '_blank');
        });
    }

    const btnCopyUrl = document.getElementById('btnCopyUrl');
    if (btnCopyUrl) {
        btnCopyUrl.addEventListener('click', () => {
            const blueprint = generateBlueprint();
            const url = getPlaygroundUrl(blueprint).replace(/\?v=\d+/, '');
            navigator.clipboard.writeText(url).then(() => {
                showToast('🌐 連結已複製！');
            });
        });
    }

    const btnDownload = document.getElementById('btnDownloadBlueprint');
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            const blueprint = generateBlueprint();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blueprint, null, 2));
            const dlNode = document.createElement('a');
            dlNode.setAttribute("href", dataStr);
            dlNode.setAttribute("download", "playground-blueprint.json");
            document.body.appendChild(dlNode);
            dlNode.click();
            dlNode.remove();
        });
    }
}

function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    // Create Toast Element
    const toast = document.createElement('div');
    toast.className = 'bg-gray-800 text-white px-4 py-2 rounded shadow-lg text-sm transition-opacity duration-300 opacity-0 transform translate-y-2';
    toast.innerText = message;

    container.appendChild(toast);

    // Animate In
    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-y-2');
    });

    // Remove after delay
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Blueprint Generator Helpers
 */
function generateBlueprint() {
    const phpVersion = document.getElementById('phpVersion').value;
    const wpVersion = document.getElementById('wpVersion').value;
    const selectedPlugins = Array.from(document.querySelectorAll('.plugin-check:checked')).map(cb => cb.value);
    const selectedTheme = document.querySelector('input[name="theme-radio"]:checked')?.value;

    const steps = [
        { "step": "login", "username": "admin", "password": "password" }
    ];

    selectedPlugins.forEach(plugin => {
        steps.push({
            "step": "installPlugin",
            "pluginData": { "resource": "wordpress.org/plugins", "slug": plugin }
        });
    });

    if (selectedTheme) {
        steps.push({
            "step": "installTheme",
            "themeData": { "resource": "wordpress.org/themes", "slug": selectedTheme }
        });
    }

    const setupCode = `<?php
        require_once 'wp-load.php';
        update_option( 'timezone_string', 'Asia/Taipei' );
        update_option( 'gmt_offset', 8 );
    ?>`;

    steps.push({ "step": "setSiteLanguage", "language": "zh_TW" });
    steps.push({ "step": "runPHP", "code": setupCode });

    return {
        "landingPage": "/wp-admin/",
        "preferredVersions": { "php": phpVersion, "wp": wpVersion },
        "features": { "networking": true },
        "steps": steps
    };
}

function encodeBase64(str) {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString);
}

function getPlaygroundUrl(blueprint) {
    const hash = encodeBase64(JSON.stringify(blueprint));
    return 'https://playground.wordpress.net/?v=' + Date.now() + '#' + hash;
}
