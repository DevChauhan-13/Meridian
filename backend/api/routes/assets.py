from fastapi import APIRouter
from api.models import AssetsResponse, AssetItem
from data.loader import ASSETS_METADATA

router = APIRouter()


@router.get("", response_model=AssetsResponse)
def get_assets():
    assets = [
        AssetItem(
            id=key,
            ticker=meta["ticker"],
            name=meta["name"],
            asset_class=meta["class"],
        )
        for key, meta in ASSETS_METADATA.items()
    ]
    return AssetsResponse(assets=assets)
