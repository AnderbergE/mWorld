// TODO: Remove this when Phaser has fixed their sound issues.
// See: https://github.com/photonstorm/phaser/issues/2280
Phaser.Sound.prototype.onEndedHandler = function () {
	this._sound.onended = null;
	this.isPlaying = false;
	this.stop();

	if (this.externalNode)
	{
		this._sound.disconnect(this.externalNode);
	}
	else
	{
		this._sound.disconnect(this.gainNode);
	}
};

Phaser.Sound.prototype.stop = function () {

   if (this.isPlaying && this._sound)
   {
	   if (this.usingWebAudio)
	   {
		   if (typeof this._sound.stop === 'undefined')
		   {
			   this._sound.noteOff(0);
		   }
		   else
		   {
			   try {
				   this._sound.stop(0);
			   }
			   catch (e)
			   {
				   //  Thanks Android 4.4
			   }
		   }
	   }
	   else if (this.usingAudioTag)
	   {
		   this._sound.pause();
		   this._sound.currentTime = 0;
	   }
   }

   this.pendingPlayback = false;
   this.isPlaying = false;
   var prevMarker = this.currentMarker;

   if (this.currentMarker !== '')
   {
	   this.onMarkerComplete.dispatch(this.currentMarker, this);
   }

   this.currentMarker = '';

   if (this.fadeTween !== null)
   {
	   this.fadeTween.stop();
   }

   if (!this.paused)
   {
	   this.onStop.dispatch(this, prevMarker);
   }

};
