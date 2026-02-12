/**
 * WP Playground TW - Enhanced JavaScript
 * Authors: Original Author, Claude (Anthropic), Antigravity
 * Version: 2.0.0
 * 
 * Key improvements:
 * - Event delegation for better performance
 * - Enhanced error handling with try-catch blocks
 * - Custom confirm modal instead of native alert
 * - Better accessibility support
 * - Optimized Base64 encoding with error handling
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let isRunning = false;
let confirmResolve = null;

/**
 * Application Initialization
 */
function initApp() {
    try {
        // 1. Initial Checks
        checkSystemMemory();

        // 2. Bind Event Listeners
        bindSidebarEvents();
        bindPresetEvents();
        bindTabEvents();
        bindLauncherEvents();
        bindBlueprintEvents();
        bindConfirmModalEvents();

        // 3. Initialize UI State
        updatePluginCounts();

        // 4. Log initialization success
        console.log('✅ WP Playground TW initialized successfully');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showToast('⚠️ 初始化失敗，請重新整理頁面');
    }
}

/**
 * System Memory Check with Device Memory API
 */
function checkSystemMemory() {
    try {
        if (navigator.deviceMemory && navigator.deviceMemory < 4) {
            const warningEl = document.getElementById('systemWarning');
            const ramSizeEl = document.getElementById('ramSize');
            if (warningEl && ramSizeEl) {
                ramSizeEl.innerText = navigator.deviceMemory;
                warningEl.classList.remove('hidden');
                console.warn(`⚠️ Low memory detected: ${navigator.deviceMemory}GB`);
            }
        }
    } catch (error) {
        console.error('Memory check error:', error);
        // Non-critical error, continue execution
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
            btnCollapseDesktop.setAttribute('aria-label', '展開側邊欄');
        } else {
            expandBtn.classList.add('hidden');
            btnCollapseDesktop.setAttribute('aria-label', '收合側邊欄');
        }
    };

    if (btnCollapseDesktop) btnCollapseDesktop.addEventListener('click', toggleDesktop);
    if (expandBtn) expandBtn.addEventListener('click', toggleDesktop);
}

/**
 * Tab Switching Logic with Event Delegation
 */
function bindTabEvents() {
    const tabContainer = document.querySelector('[role="tablist"]');
    
    if (tabContainer) {
        // Use event delegation for better performance
        tabContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action="switch-tab"]');
            if (btn) {
                const tabName = btn.dataset.tab;
                switchTab(tabName);
            }
        });
    }

    // Event delegation for plugin/theme checkboxes
    document.addEventListener('change', (e) => {
        if (e.target.matches('.plugin-check, .theme-check')) {
            updatePluginCounts();
        }
    });
}

function switchTab(tabName) {
    try {
        // Hide all contents
        document.querySelectorAll('.plugin-tab').forEach(el => {
            el.classList.add('hidden');
            el.setAttribute('aria-hidden', 'true');
        });

        // Reset all buttons style and ARIA attributes
        document.querySelectorAll('.tab-btn').forEach(el => {
            el.classList.remove('tab-btn-active');
            el.classList.add('tab-btn-inactive');
            el.setAttribute('aria-selected', 'false');
        });

        // Show selected content
        const targetContent = document.getElementById('tab-' + tabName);
        if (targetContent) {
            targetContent.classList.remove('hidden');
            targetContent.setAttribute('aria-hidden', 'false');
        }

        // Highlight button
        const targetBtn = document.getElementById('tab-btn-' + tabName);
        if (targetBtn) {
            targetBtn.classList.remove('tab-btn-inactive');
            targetBtn.classList.add('tab-btn-active');
            targetBtn.setAttribute('aria-selected', 'true');
        }
    } catch (error) {
        console.error('Tab switch error:', error);
        showToast('⚠️ 分頁切換失敗');
    }
}

/**
 * Preset Logic with Event Delegation
 */
function bindPresetEvents() {
    const presetContainer = document.querySelector('[data-action="apply-preset"]')?.parentElement;
    
    if (presetContainer) {
        presetContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action="apply-preset"]');
            if (btn) {
                applyPreset(btn.dataset.preset);
            }
        });
    }
}

function applyPreset(type) {
    try {
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
            showToast('✅ 已套用開店包設定');
        } else if (type === 'blog') {
            const targets = ['wordpress-seo', 'classic-editor'];
            targets.forEach(v => {
                const el = document.querySelector(`.plugin-check[value="${v}"]`);
                if (el) el.checked = true;
            });
            switchTab('featured');
            showToast('✅ 已套用部落格設定');
        }
        updatePluginCounts();
    } catch (error) {
        console.error('Preset application error:', error);
        showToast('⚠️ 預設套用失敗');
    }
}

/**
 * Counter Logic
 */
function updatePluginCounts() {
    try {
        ['featured', 'store', 'tools'].forEach(tab => {
            const container = document.getElementById('tab-' + tab);
            const count = container ? container.querySelectorAll('input:checked').length : 0;
            const badge = document.getElementById('count-' + tab);

            if (badge) {
                badge.innerText = count;
                badge.setAttribute('aria-label', `已選擇 ${count} 個`);
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
                themeBadge.setAttribute('aria-label', '已選擇 1 個主題');
                themeBadge.classList.remove('hidden');
            } else {
                themeBadge.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Count update error:', error);
    }
}

/**
 * Confirm Modal Events
 */
function bindConfirmModalEvents() {
    const btnCancel = document.getElementById('btnConfirmCancel');
    const btnOk = document.getElementById('btnConfirmOk');

    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            hideConfirmModal(false);
        });
    }

    if (btnOk) {
        btnOk.addEventListener('click', () => {
            hideConfirmModal(true);
        });
    }
}

/**
 * Show Custom Confirm Modal
 */
function showConfirmModal(message, details = []) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const content = document.getElementById('confirmModalContent');
        
        if (!modal || !content) {
            resolve(false);
            return;
        }

        // Store resolve function
        confirmResolve = resolve;

        // Build content
        let html = `<p class="text-gray-700">${message}</p>`;
        
        if (details.length > 0) {
            html += '<div class="mt-3 text-sm bg-blue-50 p-3 rounded border border-blue-100">';
            html += '<p class="font-medium text-blue-700 mb-1">本次啟動將包含：</p>';
            html += '<ul class="space-y-1">';
            details.forEach(item => {
                html += `<li class="text-gray-600">👉 ${item}</li>`;
            });
            html += '</ul></div>';
        } else {
            html += '<p class="mt-2 text-sm text-gray-500">本次啟動將【不包含】任何額外外掛或主題。</p>';
        }

        content.innerHTML = html;
        modal.classList.remove('hidden');
        
        // Focus on OK button for keyboard users
        setTimeout(() => {
            document.getElementById('btnConfirmOk')?.focus();
        }, 100);
    });
}

/**
 * Hide Confirm Modal
 */
function hideConfirmModal(confirmed) {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    if (confirmResolve) {
        confirmResolve(confirmed);
        confirmResolve = null;
    }
}

/**
 * Launcher & Error Handling
 */
function bindLauncherEvents() {
    const launchBtn = document.getElementById('launchBtn');
    if (launchBtn) {
        launchBtn.addEventListener('click', () => {
            launchPlayground().catch(error => {
                console.error('Launch error:', error);
                showToast('⚠️ 啟動失敗，請重試');
            });
        });
    }

    const btnRetry = document.getElementById('btnRetry');
    if (btnRetry) {
        btnRetry.addEventListener('click', () => {
            // Reset UI states to ready-to-launch and try again
            document.getElementById('errorState')?.classList.add('hidden');
            launchPlayground().catch(error => {
                console.error('Retry error:', error);
            });
        });
    }

    const btnForceReload = document.getElementById('btnForceReload');
    if (btnForceReload) {
        btnForceReload.addEventListener('click', () => {
            location.reload();
        });
    }
}

async function launchPlayground() {
    const selectedPlugins = Array.from(document.querySelectorAll('.plugin-check:checked'));
    const selectedTheme = document.querySelector('input[name="theme-radio"]:checked')?.value;

    // Safety check for restart with custom modal
    if (isRunning) {
        let details = [];
        
        if (selectedTheme) {
            details.push(`佈景主題: ${selectedTheme}`);
        }
        
        if (selectedPlugins.length > 0) {
            const pluginNames = selectedPlugins.map(cb => {
                const label = cb.closest('label');
                return label ? label.innerText.trim() : cb.value;
            }).join(', ');
            details.push(`外掛: ${pluginNames}`);
        }

        const confirmed = await showConfirmModal(
            '重新啟動將會重置所有未儲存的變更。',
            details
        );

        if (!confirmed) return;
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

    try {
        // Reset Error State
        if (errorState) errorState.classList.add('hidden');

        // Lock Button
        launchBtn.disabled = true;
        btnIcon?.classList.add('hidden');
        btnSpinner?.classList.remove('hidden');
        if (launchText) launchText.innerText = isRunning ? "重啟中..." : "啟動中...";

        // Mobile Sidebar check
        if (window.innerWidth < 768) {
            const sidebarEl = document.getElementById('sidebar');
            const sidebarOverlayEl = document.getElementById('sidebarOverlay');
            sidebarEl?.classList.add('-translate-x-full');
            sidebarOverlayEl?.classList.add('hidden');
        }

        // Show Overlay
        welcomeState?.classList.add('hidden');
        loadingState?.classList.remove('hidden');
        if (loader) loader.classList.remove('hidden');
        wpFrame?.classList.add('hidden');
        statusContainer?.classList.remove('hidden');

        // Generate Blueprint & URL
        const blueprint = generateBlueprint();
        const blueprintJson = JSON.stringify(blueprint);
        const hash = encodeBase64(blueprintJson);
        
        if (!hash) {
            throw new Error('Blueprint encoding failed');
        }
        
        const url = 'https://playground.wordpress.net/?v=' + Date.now() + '#' + hash;

        // Force iframe reset to avoid caching issues
        wpFrame.src = 'about:blank';

        // Small delay to ensure browser clears the old iframe state
        await new Promise(resolve => setTimeout(resolve, 100));
        
        wpFrame.src = url;

        // Timeout Logic (20 seconds)
        const timeoutId = setTimeout(() => {
            if (!statusContainer.classList.contains('hidden') && !loadingState.classList.contains('hidden')) {
                // Still loading after 20s
                loadingState?.classList.add('hidden');
                if (loader) loader.classList.add('hidden');
                if (errorState) errorState.classList.remove('hidden');

                // Reset Button State
                launchBtn.disabled = false;
                btnIcon?.classList.remove('hidden');
                btnSpinner?.classList.add('hidden');
                if (launchText) launchText.innerText = "啟動環境";
                
                console.error('⏱️ Playground loading timeout');
            }
        }, 20000);

        wpFrame.onload = function () {
            // Simple cross-origin check
            let isLocal = false;
            try {
                isLocal = wpFrame.contentWindow.location.href === 'about:blank';
            } catch (e) {
                // CORS Error = Success (playground is loaded)
                isLocal = false;
            }

            if (isLocal) return;

            // Clear timeout if successful load
            clearTimeout(timeoutId);

            // Wait 3 seconds for WordPress to fully initialize
            setTimeout(() => {
                statusContainer?.classList.add('hidden');
                wpFrame?.classList.remove('hidden');

                // Set Running State
                isRunning = true;
                launchBtn.disabled = false;
                btnIcon?.classList.remove('hidden');
                btnSpinner?.classList.add('hidden');

                // Switch to Restart Mode
                launchBtn.classList.remove('bg-blue-700', 'hover:bg-blue-800', 'focus:ring-blue-300');
                launchBtn.classList.add('bg-orange-600', 'hover:bg-orange-700', 'focus:ring-orange-300');
                if (launchText) launchText.innerText = "重新啟動環境";
                
                showToast('🎉 環境啟動成功！');
                console.log('✅ Playground loaded successfully');
            }, 3000);
        };

        // Error handler for iframe
        wpFrame.onerror = function(error) {
            console.error('Iframe load error:', error);
            clearTimeout(timeoutId);
            showToast('⚠️ 載入失敗，請重試');
        };

    } catch (error) {
        console.error('Launch error:', error);
        
        // Reset UI on error
        launchBtn.disabled = false;
        btnIcon?.classList.remove('hidden');
        btnSpinner?.classList.add('hidden');
        if (launchText) launchText.innerText = "啟動環境";
        
        loadingState?.classList.add('hidden');
        if (loader) loader.classList.add('hidden');
        if (errorState) errorState.classList.remove('hidden');
        
        showToast('⚠️ 啟動過程發生錯誤');
    }
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
            try {
                const blueprint = generateBlueprint();
                codeBlock.innerText = JSON.stringify(blueprint, null, 2);
                modal.classList.remove('hidden');
                modal.classList.add('modal-backdrop');
            } catch (error) {
                console.error('Blueprint generation error:', error);
                showToast('⚠️ 藍圖產生失敗');
            }
        });
    }

    // Close Modal (Multiple buttons)
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('modal-backdrop');
            }
        });
    });

    // Close modal on backdrop click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                modal.classList.remove('modal-backdrop');
            }
        });
    }

    // Share Actions
    const btnShareLine = document.getElementById('btnShareLine');
    if (btnShareLine) {
        btnShareLine.addEventListener('click', () => {
            try {
                const blueprint = generateBlueprint();
                const url = getPlaygroundUrl(blueprint).replace(/\?v=\d+/, '');
                const pluginList = blueprint.steps
                    .filter(s => s.step === 'installPlugin')
                    .map(s => s.pluginData.slug)
                    .join(', ') || '無';
                
                const text = `我剛剛用 WP Playground TW 建立了一個 WordPress 測試站！\n\n包含外掛：${pluginList}\n\n點我啟動：${url}`;
                const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
                window.open(lineUrl, '_blank', 'noopener,noreferrer');
            } catch (error) {
                console.error('Line share error:', error);
                showToast('⚠️ Line 分享失敗');
            }
        });
    }

    const btnCopyUrl = document.getElementById('btnCopyUrl');
    if (btnCopyUrl) {
        btnCopyUrl.addEventListener('click', async () => {
            try {
                const blueprint = generateBlueprint();
                const url = getPlaygroundUrl(blueprint).replace(/\?v=\d+/, '');
                await navigator.clipboard.writeText(url);
                showToast('🌐 連結已複製！');
            } catch (error) {
                console.error('Copy error:', error);
                showToast('⚠️ 複製失敗，請手動複製');
            }
        });
    }

    const btnDownload = document.getElementById('btnDownloadBlueprint');
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            try {
                const blueprint = generateBlueprint();
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blueprint, null, 2));
                const dlNode = document.createElement('a');
                dlNode.setAttribute("href", dataStr);
                dlNode.setAttribute("download", "playground-blueprint.json");
                document.body.appendChild(dlNode);
                dlNode.click();
                dlNode.remove();
                showToast('💾 JSON 已下載');
            } catch (error) {
                console.error('Download error:', error);
                showToast('⚠️ 下載失敗');
            }
        });
    }
}

/**
 * Toast Notification System
 */
function showToast(message, duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    // Create Toast Element
    const toast = document.createElement('div');
    toast.className = 'bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm pointer-events-auto toast-enter';
    toast.innerText = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    container.appendChild(toast);

    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

/**
 * Blueprint Generator Helpers
 */
function generateBlueprint() {
    const phpVersion = document.getElementById('phpVersion')?.value || '8.2';
    const wpVersion = document.getElementById('wpVersion')?.value || 'latest';
    const selectedPlugins = Array.from(document.querySelectorAll('.plugin-check:checked')).map(cb => cb.value);
    const selectedTheme = document.querySelector('input[name="theme-radio"]:checked')?.value;

    const steps = [
        { "step": "login", "username": "admin", "password": "password" }
    ];

    // Add plugins
    selectedPlugins.forEach(plugin => {
        steps.push({
            "step": "installPlugin",
            "pluginData": { "resource": "wordpress.org/plugins", "slug": plugin }
        });
    });

    // Add theme if selected
    if (selectedTheme) {
        steps.push({
            "step": "installTheme",
            "themeData": { "resource": "wordpress.org/themes", "slug": selectedTheme }
        });
    }

    // Setup code for timezone and language
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

/**
 * Enhanced Base64 Encoding with Error Handling
 */
function encodeBase64(str) {
    try {
        const bytes = new TextEncoder().encode(str);
        const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
        return btoa(binString);
    } catch (error) {
        console.error('❌ Base64 encoding error:', error);
        showToast('⚠️ 編碼失敗，請重試');
        return '';
    }
}

/**
 * Generate Playground URL from Blueprint
 */
function getPlaygroundUrl(blueprint) {
    const hash = encodeBase64(JSON.stringify(blueprint));
    if (!hash) return '';
    return 'https://playground.wordpress.net/?v=' + Date.now() + '#' + hash;
}

/**
 * Keyboard Shortcuts (Future Enhancement)
 */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to launch
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const launchBtn = document.getElementById('launchBtn');
        if (launchBtn && !launchBtn.disabled) {
            launchBtn.click();
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        document.getElementById('blueprintModal')?.classList.add('hidden');
        hideConfirmModal(false);
    }
});

console.log('🚀 WP Playground TW v2.0.0 - Ready to launch!');
