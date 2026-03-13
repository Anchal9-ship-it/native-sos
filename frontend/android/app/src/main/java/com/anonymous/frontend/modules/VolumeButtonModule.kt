package com.anonymous.frontend.modules

import android.content.Context
import android.media.AudioManager
import android.view.KeyEvent
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class VolumeButtonModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private val audioManager: AudioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var volumeUpPressed = false
    private var volumeDownPressed = false
    private var lastPressTime = 0L
    private val DOUBLE_PRESS_THRESHOLD = 500 // milliseconds

    override fun getName(): String {
        return "VolumeButtonModule"
    }

    @ReactMethod
    fun enableVolumeButtonListener(promise: Promise) {
        try {
            // Note: Volume button detection happens in MainActivity
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun disableVolumeButtonListener(promise: Promise) {
        try {
            volumeUpPressed = false
            volumeDownPressed = false
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    fun onVolumeKeyPressed(keyCode: Int): Boolean {
        val currentTime = System.currentTimeMillis()

        when (keyCode) {
            KeyEvent.KEYCODE_VOLUME_UP -> {
                volumeUpPressed = true
                checkBothPressed(currentTime)
                return true
            }
            KeyEvent.KEYCODE_VOLUME_DOWN -> {
                volumeDownPressed = true
                checkBothPressed(currentTime)
                return true
            }
        }
        return false
    }

    fun onVolumeKeyReleased(keyCode: Int) {
        when (keyCode) {
            KeyEvent.KEYCODE_VOLUME_UP -> volumeUpPressed = false
            KeyEvent.KEYCODE_VOLUME_DOWN -> volumeDownPressed = false
        }
    }

    private fun checkBothPressed(currentTime: Long) {
        if (volumeUpPressed && volumeDownPressed) {
            if (currentTime - lastPressTime > DOUBLE_PRESS_THRESHOLD) {
                lastPressTime = currentTime
                sendVolumeButtonEvent()
            }
        }
    }

    private fun sendVolumeButtonEvent() {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onVolumeButtonsPressed", null)
    }
}
