package com.anonymous.frontend.modules

import android.content.Context
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraManager
import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*

class FlashlightModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val cameraManager: CameraManager = reactContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private var cameraId: String? = null
    private var isFlashlightOn = false

    init {
        try {
            cameraId = cameraManager.cameraIdList.firstOrNull()
        } catch (e: CameraAccessException) {
            e.printStackTrace()
        }
    }

    override fun getName(): String {
        return "FlashlightModule"
    }

    @ReactMethod
    fun turnOn(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && cameraId != null) {
                cameraManager.setTorchMode(cameraId!!, true)
                isFlashlightOn = true
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Flashlight not supported")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun turnOff(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && cameraId != null) {
                cameraManager.setTorchMode(cameraId!!, false)
                isFlashlightOn = false
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Flashlight not supported")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun toggle(promise: Promise) {
        if (isFlashlightOn) {
            turnOff(promise)
        } else {
            turnOn(promise)
        }
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        promise.resolve(isFlashlightOn)
    }
}
