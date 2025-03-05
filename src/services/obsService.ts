import OBSWebSocket from 'obs-websocket-js';

class OBSService {
  private obs: OBSWebSocket;
  private static instance: OBSService;

  private constructor() {
    this.obs = new OBSWebSocket();
  }

  public static getInstance(): OBSService {
    if (!OBSService.instance) {
      OBSService.instance = new OBSService();
    }
    return OBSService.instance;
  }

  async connect() {
    try {
      await this.obs.connect('ws://localhost:4455', '');
      console.log('Connected to OBS');
    } catch (error) {
      console.error('Failed to connect to OBS:', error);
    }
  }

  async startStreaming() {
    await this.obs.call('StartStream');
  }

  async stopStreaming() {
    await this.obs.call('StopStream');
  }

  async startRecording() {
    await this.obs.call('StartRecord');
  }

  async stopRecording() {
    await this.obs.call('StopRecord');
  }

  async setCurrentScene(sceneName: string) {
    await this.obs.call('SetCurrentProgramScene', {
      sceneName: sceneName
    });
  }

  async getScenes() {
    const { scenes } = await this.obs.call('GetSceneList');
    return scenes;
  }
  
  // New methods for source control
  async getSceneSources(sceneName: string) {
    const { sceneItems } = await this.obs.call('GetSceneItemList', {
      sceneName: sceneName
    });
    return sceneItems;
  }
  
  async setSourceVisibility(sceneName: string, sourceName: string, visible: boolean) {
    const sourceId = await this.getSourceId(sceneName, sourceName);
    if (typeof sourceId !== 'number') {
      throw new Error('Source not found');
    }
    
    await this.obs.call('SetSceneItemEnabled', {
      sceneName: sceneName,
      sceneItemId: sourceId,
      sceneItemEnabled: visible
    });
  }
  
  async getSourceVisibility(sceneName: string, sourceName: string) {
    const sourceId = await this.getSourceId(sceneName, sourceName);
    if (typeof sourceId !== 'number') {
      throw new Error('Source not found');
    }

    const { sceneItemEnabled } = await this.obs.call('GetSceneItemEnabled', {
      sceneName: sceneName,
      sceneItemId: sourceId
    });
    return sceneItemEnabled;
  }
  
  private async getSourceId(sceneName: string, sourceName: string) {
    const sources = await this.getSceneSources(sceneName);
    const source = sources.find(item => item.sourceName === sourceName);
    return source?.sceneItemId;
  }
  async getStreamingStatus() {
    const { outputActive } = await this.obs.call('GetStreamStatus');
    return outputActive;
  }

  async getRecordingStatus() {
    const { outputActive } = await this.obs.call('GetRecordStatus');
    return outputActive;
  }
}

export default OBSService;