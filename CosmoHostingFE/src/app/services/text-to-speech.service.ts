import { Injectable } from '@angular/core';

  
@Injectable({
    providedIn: 'root',
  })
  export class TextToSpeechService {
    private voicesLoaded = false;
  
    private loadVoices(): Promise<SpeechSynthesisVoice[]> {
      return new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.voicesLoaded = true;
          resolve(voices);
        } else {
          speechSynthesis.addEventListener('voiceschanged', () => {
            const loadedVoices = speechSynthesis.getVoices();
            this.voicesLoaded = true;
            resolve(loadedVoices);
          });
        }
      });
    }
  
    async speak(text: string): Promise<void> {
      const voices = this.voicesLoaded
        ? speechSynthesis.getVoices()
        : await this.loadVoices();
  
      const selectedVoice = voices.find(v => v.lang === 'es-MX' || v.lang.startsWith('es'));
  
      return new Promise((resolve, reject) => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
  
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
  
        utterance.lang = 'es-MX';
        utterance.rate = 1;
  
        utterance.onend = () => {
          console.log("Texto leído correctamente");
          resolve();
        };
  
        utterance.onerror = (err) => {
          console.error("Error en el TTS:", err);
          reject(err);
        };
  
        console.log("Voz usada:", selectedVoice?.name);
        synth.speak(utterance);
      });
    }
  
    stop(): void {
      window.speechSynthesis.cancel();
    }
  }
  