import { Asset } from '../types';

const ASSETS_KEY = 'lumina_assets_db';

class AssetService {
  private getAssetsDB(): Asset[] {
    const str = localStorage.getItem(ASSETS_KEY);
    return str ? JSON.parse(str) : [];
  }

  private saveAssetsDB(assets: Asset[]) {
    try {
        localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
    } catch (e) {
        console.error("Storage quota exceeded, removing oldest assets");
        // Simple eviction policy: remove first 5 items
        if (assets.length > 5) {
            this.saveAssetsDB(assets.slice(5));
        }
    }
  }

  getAssets(userId: string): Asset[] {
    const all = this.getAssetsDB();
    return all.filter(a => a.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }

  saveAsset(userId: string, content: { type: string, url?: string, text?: string }, toolId: string, toolName: string): Asset {
    const assets = this.getAssetsDB();
    
    const newAsset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      type: content.type as any,
      url: content.url || content.text || '',
      createdAt: Date.now(),
      toolId,
      toolName
    };

    assets.push(newAsset);
    this.saveAssetsDB(assets);
    return newAsset;
  }

  deleteAsset(assetId: string) {
    const assets = this.getAssetsDB();
    const newAssets = assets.filter(a => a.id !== assetId);
    this.saveAssetsDB(newAssets);
  }
}

export const assetService = new AssetService();