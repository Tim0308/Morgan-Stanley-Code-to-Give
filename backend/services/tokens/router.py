"""
Tokens microservice router
Handles token balance, transactions, shop, and redemptions
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import logging

from core.auth import get_current_user, get_current_parent, AuthUser
from models.tokens import (
    TokenBalance, ShopItem, RedeemTokensRequest,
    TokenHistoryResponse, Redemption
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/balance")
async def get_token_balance(
    child_id: str,
    current_user: AuthUser = Depends(get_current_parent)
):
    """Get token balance for a child"""
    return {"message": "Token balance endpoint - to be implemented"}


@router.get("/shop/items")
async def get_shop_items(current_user: AuthUser = Depends(get_current_user)):
    """Get available shop items"""
    return {"message": "Shop items endpoint - to be implemented"}


@router.post("/redeem")
async def redeem_tokens(
    redemption_data: RedeemTokensRequest,
    current_user: AuthUser = Depends(get_current_parent)
):
    """Redeem tokens for shop items"""
    return {"message": "Token redemption endpoint - to be implemented"} 