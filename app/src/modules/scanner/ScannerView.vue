<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Scanner</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleFlashlight">
            <ion-icon :icon="flashlightOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="scanner-container">
        <div class="camera-preview" ref="cameraPreview">
          <!-- Camera preview will be rendered here -->
          <div class="scan-overlay">
            <div class="scan-frame">
              <div class="corner top-left"></div>
              <div class="corner top-right"></div>
              <div class="corner bottom-left"></div>
              <div class="corner bottom-right"></div>
            </div>
          </div>
        </div>

        <div class="actions">
          <ion-button
            expand="block"
            size="large"
            @click="startScan"
            :disabled="isScanning"
          >
            <ion-icon slot="start" :icon="barcodeOutline"></ion-icon>
            {{ isScanning ? 'Scanning...' : 'Start Scan' }}
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            @click="manualEntry"
          >
            <ion-icon slot="start" :icon="keypadOutline"></ion-icon>
            Manual Entry
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon
} from '@ionic/vue'
import { barcodeOutline, flashlightOutline, keypadOutline } from 'ionicons/icons'

const isScanning = ref(false)
const cameraPreview = ref<HTMLElement>()

const startScan = async () => {
  // TODO: Implement scanning logic
  console.log('Starting scan...')
  isScanning.value = true
}

const toggleFlashlight = () => {
  // TODO: Implement flashlight toggle
  console.log('Toggle flashlight')
}

const manualEntry = () => {
  // TODO: Implement manual entry
  console.log('Manual entry')
}
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

.actions {
  padding: 1rem;
}

.actions ion-button {
  margin-bottom: 0.5rem;
}
</style>
