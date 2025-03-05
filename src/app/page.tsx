'use client';

import { Button } from '@/components/ui/button';
import OBSService from '@/services/obsService';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [scenes, setScenes] = useState<any[]>([]);
  const [currentScene, setCurrentScene] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const obs = OBSService.getInstance();

  useEffect(() => {
    const initOBS = async () => {
      await obs.connect();
      const sceneList = await obs.getScenes();
      setScenes(sceneList);
      
      if (sceneList.length > 0 && sceneList[0]?.sceneName) {
        const firstSceneName = String(sceneList[0].sceneName);
        setCurrentScene(firstSceneName);
        const sceneSources = await obs.getSceneSources(firstSceneName);
        setSources(sceneSources);
      }
      
      const streamStatus = await obs.getStreamingStatus();
      setIsStreaming(streamStatus);
      
      const recordStatus = await obs.getRecordingStatus();
      setIsRecording(recordStatus);
    };

    initOBS();
  }, []);

  const handleStream = async () => {
    try {
      if (isStreaming) {
        await obs.stopStreaming();
      } else {
        await obs.startStreaming();
      }
      setIsStreaming(!isStreaming);
    } catch (error) {
      console.error('Streaming error:', error);
    }
  };

  const handleRecord = async () => {
    try {
      if (isRecording) {
        await obs.stopRecording();
      } else {
        await obs.startRecording();
      }
      setIsRecording(!isRecording);
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const handleSceneChange = async (sceneName: string) => {
    try {
      await obs.setCurrentScene(sceneName);
      setCurrentScene(sceneName);
      const sceneSources = await obs.getSceneSources(sceneName);
      setSources(sceneSources);
    } catch (error) {
      console.error('Scene change error:', error);
    }
  };

  const toggleSourceVisibility = async (sourceName: string) => {
    try {
      const isVisible = await obs.getSourceVisibility(currentScene, sourceName);
      await obs.setSourceVisibility(currentScene, sourceName, !isVisible);
      
      // Refresh sources list
      const sceneSources = await obs.getSceneSources(currentScene);
      setSources(sceneSources);
    } catch (error) {
      console.error('Source visibility toggle error:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header with Logo */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto py-4 px-8 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">C</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Church Stream Control</h1>
            <p className="text-sm text-gray-500">Broadcasting Management System</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">Broadcast Controls</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Button
                variant={isStreaming ? "destructive" : "default"}
                size="lg"
                onClick={handleStream}
                className="h-20 sm:h-24 text-lg sm:text-xl shadow-sm"
              >
                {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
              </Button>
              
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                onClick={handleRecord}
                className="h-20 sm:h-24 text-lg sm:text-xl shadow-sm"
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
            </div>
          </div>

          {/* Scene Selection */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">Active Scene</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scenes.map((scene) => (
                <Button
                  key={scene.sceneName}
                  variant={currentScene === scene.sceneName ? "secondary" : "outline"}
                  onClick={() => handleSceneChange(scene.sceneName)}
                  className="h-14 sm:h-16 shadow-sm text-sm sm:text-base"
                >
                  {scene.sceneName}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Sources Panel */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">Source Controls</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {sources.map((source) => (
              <Button
                key={source.sourceName}
                variant={source.sceneItemEnabled ? "default" : "outline"}
                onClick={() => toggleSourceVisibility(source.sourceName)}
                className="h-14 sm:h-16 shadow-sm"
              >
                <div className="text-center">
                  <div className="text-xs sm:text-sm">{source.sourceName}</div>
                  <div className="text-xs opacity-60">
                    {source.sceneItemEnabled ? 'Visible' : 'Hidden'}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <div>© {new Date().getFullYear()} Church Stream Control. All rights reserved.</div>
          <div className="mt-1">Made with ❤️ by Roland Tech</div>
        </div>
      </div>
    </main>
  );
}