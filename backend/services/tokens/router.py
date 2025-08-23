"""
Tokens microservice router
Handles token balance, transactions, shop, and redemptions
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
import logging

from core.auth import get_current_user, get_current_parent, AuthUser
from models.tokens import (
    TokenBalance, ShopItem, RedeemTokensRequest,
    TokenHistoryResponse, Redemption
)
from .service import TokensService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/balance")
async def get_token_balance(
    child_id: str = Query(..., description="Child ID"),
    current_user: AuthUser = Depends(get_current_parent)
):
    """Get token balance for a child"""
    try:
        service = TokensService()
        return await service.get_token_balance(child_id, current_user.user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to get token balance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve token balance"
        )


@router.get("/shop/items")
async def get_shop_items(current_user: AuthUser = Depends(get_current_user)):
    """Get available shop items"""
    try:
        service = TokensService()
        return await service.get_shop_items()
    except Exception as e:
        logger.error(f"Failed to get shop items: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve shop items"
        )


@router.post("/redeem")
async def redeem_tokens(
    redemption_data: RedeemTokensRequest,
    current_user: AuthUser = Depends(get_current_parent)
):
    """Redeem tokens for shop items"""
    try:
        service = TokensService()
        return await service.redeem_tokens(
            redemption_data.child_id,
            redemption_data.item_id, 
            redemption_data.quantity,
            current_user.user_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to redeem tokens: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process token redemption"
        )


@router.get("/history")
async def get_token_history(
    child_id: str = Query(..., description="Child ID"),
    limit: int = Query(default=20, ge=1, le=100, description="Number of transactions to return"),
    cursor: str = Query(default=None, description="Pagination cursor"),
    current_user: AuthUser = Depends(get_current_parent)
):
    """Get token transaction history for a child"""
    try:
        service = TokensService()
        return await service.get_token_history(child_id, current_user.user_id, limit, cursor)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to get token history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve token history"
        ) 