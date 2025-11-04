<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Scanner</ion-title>
        <ion-buttons slot="end">
          <!-- Sync status badge -->
          <ion-badge :color="syncBadgeColor" class="sync-badge">
            {{ syncStore.syncStatusText }}
          </ion-badge>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="scanner-container">
        <!-- Camera preview area -->
        <div class="camera-preview" ref="cameraPreviewContainer">
          <video
            ref="videoElement"
            class="scanner-video"
            autoplay
            playsinline
            muted
          ></video>

          <div class="scan-overlay">
            <div class="scan-frame">
              <div class="corner top-left"></div>
              <div class="corner top-right"></div>
              <div class="corner bottom-left"></div>
              <div class="corner bottom-right"></div>
            </div>
            <div
              v-if="scannerStore.isScanning"
              class="scan-line scanning"
            ></div>
          </div>

          <!-- Scan instructions -->
          <div class="scan-instructions">
            <ion-chip :color="scannerStore.isScanning ? 'success' : 'dark'">
              <ion-label>
                {{
                  scannerStore.isScanning
                    ? 'Align barcode within frame'
                    : 'Ready to scan'
                }}
              </ion-label>
            </ion-chip>
          </div>

          <!-- Network status -->
          <div v-if="!syncStore.isOnline" class="offline-indicator">
            <ion-chip color="warning">
              <ion-icon :icon="cloudOfflineOutline"></ion-icon>
              <ion-label>Offline Mode</ion-label>
            </ion-chip>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="quick-actions">
          <ion-button
            expand="block"
            size="large"
            @click="toggleScanning"
            :color="scannerStore.isScanning ? 'danger' : 'primary'"
          >
            <ion-icon
              slot="start"
              :icon="scannerStore.isScanning ? stopCircleOutline : barcodeOutline"
            ></ion-icon>
            {{ scannerStore.isScanning ? 'Stop Scanning' : 'Start Scan' }}
          </ion-button>

          <ion-button expand="block" fill="outline" @click="openManualEntry">
            <ion-icon slot="start" :icon="keypadOutline"></ion-icon>
            Manual Entry
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            @click="syncStore.manualSync()"
            :disabled="!syncStore.hasPendingSync || !syncStore.isOnline"
          >
            <ion-icon slot="start" :icon="syncOutline"></ion-icon>
            Sync Now ({{ syncStore.queueSize }})
          </ion-button>
        </div>

        <!-- Recent scans -->
        <div class="recent-scans" v-if="scannerStore.recentScans.length > 0">
          <div class="section-header">
            <h3>Recent Scans</h3>
            <ion-button
              fill="clear"
              size="small"
              @click="scannerStore.clearRecentScans()"
            >
              Clear
            </ion-button>
          </div>

          <ion-list>
            <ion-item v-for="scan in scannerStore.recentScans" :key="scan.timestamp">
              <ion-label>
                <h2>{{ scan.originalBarcode }}</h2>
                <p>Internal: {{ scan.internalBarcode }}</p>
                <p class="scan-time">{{ formatTime(scan.timestamp) }}</p>
              </ion-label>
              <ion-badge slot="end" color="medium">
                {{ scan.format }}
              </ion-badge>
            </ion-item>
          </ion-list>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <ion-icon :icon="barcodeOutline" size="large"></ion-icon>
          <p>No scans yet</p>
          <p class="subtitle">Tap "Start Scan" to begin</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonChip,
  alertController
} from '@ionic/vue'
import {
  barcodeOutline,
  keypadOutline,
  syncOutline,
  stopCircleOutline,
  cloudOfflineOutline
} from 'ionicons/icons'
import { useScannerStore } from './scanner.store'
import { useSyncStore } from '../sync/sync.store'

const scannerStore = useScannerStore()
const syncStore = useSyncStore()

const videoElement = ref<HTMLVideoElement>()
const cameraPreviewContainer = ref<HTMLElement>()

// Computed
const syncBadgeColor = computed(() => {
  if (syncStore.isSyncing) return 'warning'
  if (!syncStore.isOnline) return 'danger'
  if (syncStore.hasPendingSync) return 'warning'
  return 'success'
})

// Methods
async function toggleScanning() {
  if (scannerStore.isScanning) {
    stopScanning()
  } else {
    await startScanning()
  }
}

async function startScanning() {
  if (!videoElement.value) {
    console.error('Video element not found')
    return
  }

  try {
    await scannerStore.startScanning(videoElement.value)
  } catch (error) {
    console.error('Failed to start scanning:', error)
  }
}

function stopScanning() {
  scannerStore.stopScanning()
}

async function openManualEntry() {
  const alert = await alertController.create({
    header: 'Manual Entry',
    message: 'Enter barcode manually',
    inputs: [
      {
        name: 'barcode',
        type: 'text',
        placeholder: 'Enter barcode...',
        attributes: {
          autocapitalize: 'off',
          autocorrect: 'off'
        }
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Submit',
        handler: async (data) => {
          if (data.barcode) {
            await scannerStore.processManualEntry(data.barcode)
          }
        }
      }
    ]
  })

  await alert.present()
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`

  return date.toLocaleDateString()
}

// Lifecycle
onMounted(async () => {
  // Initialize stores
  await scannerStore.initialize()
  await syncStore.initialize()

  // Request camera permissions
  await scannerStore.requestPermissions()
})

onUnmounted(() => {
  stopScanning()
})
</script>

<style scoped>
.scanner-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.camera-preview {
  position: relative;
  flex: 1;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-frame {
  width: 250px;
  height: 250px;
  position: relative;
}

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid var(--ion-color-primary);
}

.corner.top-left {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.corner.top-right {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.corner.bottom-left {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.corner.bottom-right {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

.scan-line {
  position: absolute;
  width: 250px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--ion-color-primary),
    transparent
  );
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
}

.scan-line.scanning {
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% {
    transform: translateY(-125px);
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    transform: translateY(125px);
    opacity: 0;
  }
}

.scan-instructions {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.offline-indicator {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.sync-badge {
  margin-right: 8px;
  font-size: 0.7rem;
}

.quick-actions {
  padding: 1rem;
  background: var(--ion-background-color);
}

.quick-actions ion-button {
  margin-bottom: 0.5rem;
}

.recent-scans {
  padding: 1rem;
  padding-top: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-header h3 {
  margin: 0;
  color: var(--ion-text-color);
}

.scan-time {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}

.empty-state {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.empty-state p {
  margin: 0.5rem 0;
}

.empty-state .subtitle {
  font-size: 0.875rem;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .camera-preview {
    background: #000;
  }
}
</style>
