import { useState, useRef, useEffect } from "react";
import type { Audiobook } from "@/domain/audiobook";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";

interface AudioPlayerProps {
	audiobook: Audiobook;
}

export function AudioPlayer({ audiobook }: AudioPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [isMuted, setIsMuted] = useState(false);
	const [playbackRate, setPlaybackRate] = useState(1);
	const [isExpanded, setIsExpanded] = useState(false);
	const [audioError, setAudioError] = useState<string | null>(null);

	// Reset state and load new audio when audiobook changes
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		// Reset state for new audiobook
		setIsPlaying(false);
		setCurrentTime(0);
		setDuration(0);
		setAudioError(null);

		// Load the new audio source
		audio.load();

		const updateTime = () => setCurrentTime(audio.currentTime);
		const updateDuration = () => {
			setDuration(audio.duration);
			setAudioError(null);
		};
		const handleEnded = () => setIsPlaying(false);
		const handleCanPlay = () => setAudioError(null);
		const handleError = () => {
			setAudioError("Não foi possível carregar o áudio. Verifique se o link está correto.");
			setIsPlaying(false);
		};

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("canplay", handleCanPlay);
		audio.addEventListener("error", handleError);

		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("loadedmetadata", updateDuration);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("canplay", handleCanPlay);
			audio.removeEventListener("error", handleError);
		};
	}, [audiobook.id, audiobook.audio_file_url]);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.playbackRate = playbackRate;
		}
	}, [playbackRate]);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = isMuted ? 0 : volume;
		}
	}, [volume, isMuted]);

	const togglePlay = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0];
			setCurrentTime(value[0]);
		}
	};

	const handleVolumeChange = (value: number[]) => {
		setVolume(value[0]);
		setIsMuted(false);
	};

	const toggleMute = () => {
		setIsMuted(!isMuted);
	};

	const skipForward = () => {
		if (audioRef.current) {
			audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
		}
	};

	const skipBackward = () => {
		if (audioRef.current) {
			audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
		}
	};

	const formatTime = (time: number) => {
		if (isNaN(time)) return "0:00";
		const hours = Math.floor(time / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		const seconds = Math.floor(time % 60);
		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
		}
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	return (
		<div
			className="fixed bottom-0 left-0 right-0 z-[9999] pb-[env(safe-area-inset-bottom)]"
			style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999 }}
		>
			<div className="w-full max-w-7xl mx-auto sm:px-4 sm:pb-4">
				<div className="bg-white backdrop-blur-md shadow-2xl border-t-2 border-violet-300 sm:border sm:border-violet-200/50 sm:rounded-xl rounded-none">
					<audio ref={audioRef} src={audiobook.audio_file_url} preload="metadata" />

					{/* Mobile Compact View */}
					<div className="sm:hidden">
						{/* Collapsed mobile player */}
						{!isExpanded && (
							<div className="p-3">
								<div className="flex items-center gap-3">
									{audiobook.cover_image_url && (
										<img
											src={audiobook.cover_image_url}
											alt={audiobook.title}
											className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
										/>
									)}
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sm line-clamp-1">{audiobook.title}</p>
										{audiobook.author && (
											<p className="text-xs text-gray-500 line-clamp-1">
												{audiobook.author}
											</p>
										)}
										{audioError ? (
											<p className="text-xs text-red-500 line-clamp-1">{audioError}</p>
										) : (
											<p className="text-xs text-gray-500">{formatTime(currentTime)} / {formatTime(duration)}</p>
										)}
									</div>
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={skipBackward}
											className="h-9 w-9 touch-manipulation"
										>
											<SkipBack className="h-4 w-4" />
										</Button>
										<Button
											variant="default"
											size="icon"
											onClick={togglePlay}
											className="h-11 w-11 rounded-full touch-manipulation"
										>
											{isPlaying ? (
												<Pause className="h-5 w-5" />
											) : (
												<Play className="h-5 w-5 ml-0.5" />
											)}
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={skipForward}
											className="h-9 w-9 touch-manipulation"
										>
											<SkipForward className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setIsExpanded(true)}
											className="h-9 w-9 touch-manipulation"
										>
											<ChevronUp className="h-4 w-4" />
										</Button>
									</div>
								</div>
								{/* Mini progress bar */}
								<div className="mt-2">
									<Slider
										value={[currentTime]}
										max={duration || 100}
										step={0.1}
										onValueChange={handleSeek}
										className="cursor-pointer touch-manipulation"
									/>
								</div>
							</div>
						)}

						{/* Expanded mobile player */}
						{isExpanded && (
							<div className="p-4 pb-6">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsExpanded(false)}
									className="w-full mb-3 touch-manipulation"
								>
									<ChevronDown className="h-4 w-4 mr-1" />
									Minimizar
								</Button>

								<div className="flex items-center gap-4 mb-4">
									{audiobook.cover_image_url && (
										<img
											src={audiobook.cover_image_url}
											alt={audiobook.title}
											className="w-20 h-20 rounded-lg object-cover"
										/>
									)}
									<div className="flex-1 min-w-0">
										<h3 className="font-semibold text-lg line-clamp-2">{audiobook.title}</h3>
										{audiobook.author && (
											<p className="text-sm text-gray-600 line-clamp-1">
												{audiobook.author}
											</p>
										)}
										{audioError ? (
											<p className="text-sm text-red-500">{audioError}</p>
										) : (
											<p className="text-sm text-gray-500">Reproduzindo</p>
										)}
									</div>
								</div>

								{/* Progress bar */}
								<div className="space-y-2 mb-6">
									<Slider
										value={[currentTime]}
										max={duration || 100}
										step={0.1}
										onValueChange={handleSeek}
										className="cursor-pointer touch-manipulation"
									/>
									<div className="flex justify-between text-xs text-gray-500">
										<span>{formatTime(currentTime)}</span>
										<span>{formatTime(duration)}</span>
									</div>
								</div>

								{/* Main controls */}
								<div className="flex items-center justify-center gap-4 mb-6">
									<Button
										variant="ghost"
										size="icon"
										onClick={skipBackward}
										className="h-12 w-12 touch-manipulation"
									>
										<SkipBack className="h-6 w-6" />
									</Button>
									<Button
										variant="default"
										size="icon"
										onClick={togglePlay}
										className="h-16 w-16 rounded-full touch-manipulation"
									>
										{isPlaying ? (
											<Pause className="h-8 w-8" />
										) : (
											<Play className="h-8 w-8 ml-1" />
										)}
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={skipForward}
										className="h-12 w-12 touch-manipulation"
									>
										<SkipForward className="h-6 w-6" />
									</Button>
								</div>

								{/* Additional controls */}
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Button
											variant="ghost"
											size="icon"
											onClick={toggleMute}
											className="h-10 w-10 touch-manipulation"
										>
											{isMuted ? (
												<VolumeX className="h-5 w-5" />
											) : (
												<Volume2 className="h-5 w-5" />
											)}
										</Button>
										<Slider
											value={[isMuted ? 0 : volume]}
											max={1}
											step={0.01}
											onValueChange={handleVolumeChange}
											className="w-24 cursor-pointer touch-manipulation"
										/>
									</div>

									<div className="flex items-center gap-2">
										<span className="text-sm text-gray-600">Velocidade:</span>
										<Select
											value={playbackRate.toString()}
											onValueChange={(value) => setPlaybackRate(parseFloat(value))}
										>
											<SelectTrigger className="w-20 h-9 touch-manipulation">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="0.5">0.5x</SelectItem>
												<SelectItem value="0.75">0.75x</SelectItem>
												<SelectItem value="1">1x</SelectItem>
												<SelectItem value="1.25">1.25x</SelectItem>
												<SelectItem value="1.5">1.5x</SelectItem>
												<SelectItem value="1.75">1.75x</SelectItem>
												<SelectItem value="2">2x</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Desktop View */}
					<div className="hidden sm:block">
						<div className="px-6 pt-6 pb-3">
							<div className="flex items-start gap-4">
								{audiobook.cover_image_url && (
									<img
										src={audiobook.cover_image_url}
										alt={audiobook.title}
										className="w-16 md:w-20 h-16 md:h-20 rounded-lg object-cover"
									/>
								)}
								<div className="flex-1 min-w-0">
									<h3 className="text-lg md:text-xl font-semibold line-clamp-1">{audiobook.title}</h3>
									{audiobook.author && (
										<p className="text-sm text-gray-600 mt-1 line-clamp-1">
											{audiobook.author}
										</p>
									)}
									{audioError ? (
										<p className="text-sm text-red-500 mt-1">{audioError}</p>
									) : (
										<p className="text-sm text-gray-500 mt-1">Reproduzindo</p>
									)}
								</div>
							</div>
						</div>
						<div className="px-6 pb-6 space-y-4">
							{/* Progress Bar */}
							<div className="space-y-2">
								<Slider
									value={[currentTime]}
									max={duration || 100}
									step={0.1}
									onValueChange={handleSeek}
									className="cursor-pointer"
								/>
								<div className="flex justify-between text-xs text-gray-500">
									<span>{formatTime(currentTime)}</span>
									<span>{formatTime(duration)}</span>
								</div>
							</div>

							{/* Controls */}
							<div className="flex items-center justify-between gap-2 md:gap-4">
								<div className="flex items-center gap-1 md:gap-2 flex-1">
									<Button
										variant="ghost"
										size="icon"
										onClick={toggleMute}
										className="h-8 w-8"
									>
										{isMuted ? (
											<VolumeX className="h-4 w-4" />
										) : (
											<Volume2 className="h-4 w-4" />
										)}
									</Button>
									<Slider
										value={[isMuted ? 0 : volume]}
										max={1}
										step={0.01}
										onValueChange={handleVolumeChange}
										className="w-16 md:w-24 cursor-pointer"
									/>
								</div>

								<div className="flex items-center gap-1 md:gap-2">
									<Button
										variant="ghost"
										size="icon"
										onClick={skipBackward}
										className="h-9 w-9 md:h-10 md:w-10"
									>
										<SkipBack className="h-4 w-4 md:h-5 md:w-5" />
									</Button>
									<Button
										variant="default"
										size="icon"
										onClick={togglePlay}
										className="h-11 w-11 md:h-12 md:w-12 rounded-full"
									>
										{isPlaying ? (
											<Pause className="h-5 w-5 md:h-6 md:w-6" />
										) : (
											<Play className="h-5 w-5 md:h-6 md:w-6 ml-0.5" />
										)}
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={skipForward}
										className="h-9 w-9 md:h-10 md:w-10"
									>
										<SkipForward className="h-4 w-4 md:h-5 md:w-5" />
									</Button>
								</div>

								<div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
									<span className="text-xs md:text-sm text-gray-600 hidden md:inline">Velocidade:</span>
									<Select
										value={playbackRate.toString()}
										onValueChange={(value) => setPlaybackRate(parseFloat(value))}
									>
										<SelectTrigger className="w-16 md:w-20 h-8">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="0.5">0.5x</SelectItem>
											<SelectItem value="0.75">0.75x</SelectItem>
											<SelectItem value="1">1x</SelectItem>
											<SelectItem value="1.25">1.25x</SelectItem>
											<SelectItem value="1.5">1.5x</SelectItem>
											<SelectItem value="1.75">1.75x</SelectItem>
											<SelectItem value="2">2x</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
