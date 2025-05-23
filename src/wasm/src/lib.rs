use wasm_bindgen::prelude::*;
use web_sys::{console, AudioContext, GainNode};

#[wasm_bindgen]
pub struct AudioProcessor {
    context: AudioContext,
    gain_node: GainNode,
}

#[wasm_bindgen]
impl AudioProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Result<AudioProcessor, JsValue> {
        // Create audio context
        let context = AudioContext::new()?;
        
        // Create gain node for volume control
        let gain_node = context.create_gain()?;
        gain_node.connect_with_audio_node(&context.destination())?;
        
        Ok(AudioProcessor {
            context,
            gain_node,
        })
    }
    
    #[wasm_bindgen]
    pub fn set_volume(&self, volume: f32) -> Result<(), JsValue> {
        let gain_param = self.gain_node.gain();
        gain_param.set_value(volume);
        Ok(())
    }
    
    #[wasm_bindgen]
    pub fn get_sample_rate(&self) -> f32 {
        self.context.sample_rate()
    }
    
    #[wasm_bindgen]
    pub fn log_message(&self, message: &str) {
        console::log_1(&JsValue::from_str(message));
    }
    
    #[wasm_bindgen]
    pub fn adjust_playback_speed(&self, speed: f32) -> f32 {
        // Simple validation and processing
        let clamped_speed = if speed < 0.5 {
            0.5
        } else if speed > 3.0 {
            3.0
        } else {
            speed
        };
        
        // In a real implementation, you would apply this to audio processing
        self.log_message(&format!("Setting playback speed to {}", clamped_speed));
        clamped_speed
    }
}

#[wasm_bindgen(start)]
pub fn start() {
    console::log_1(&JsValue::from_str("WebAssembly podcast player module initialized"));
}