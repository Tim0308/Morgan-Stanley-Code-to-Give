"""
Pydantic models for token system and shop
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .base import BaseResponse, ReasonType, RedemptionStatus, UUIDField, TimestampField


# Token account models
class TokenAccount(BaseResponse):
    """Token account model"""
    child_id: UUIDField
    balance: int
    weekly_earned: int = 0
    rank_percentile: Optional[float] = None


class TokenBalance(BaseResponse):
    """Token balance response"""
    balance: int
    weekly_earned: int
    rank_percentile: Optional[float] = None
    rank_position: Optional[int] = None


# Transaction models
class TokenTransactionBase(BaseModel):
    """Base token transaction model"""
    account_id: UUIDField
    delta: int  # positive for earning, negative for spending
    reason: ReasonType
    ref_table: Optional[str] = None
    ref_id: Optional[UUIDField] = None


class TokenTransactionCreate(TokenTransactionBase):
    """Token transaction creation model"""
    actor_id: Optional[UUIDField] = None


class TokenTransaction(TokenTransactionBase, BaseResponse):
    """Token transaction response model"""
    id: UUIDField
    actor_id: Optional[UUIDField] = None
    created_at: TimestampField


class TokenTransactionWithDetails(TokenTransaction):
    """Token transaction with additional details"""
    description: str
    actor_name: Optional[str] = None


# Shop item models
class ShopItemBase(BaseModel):
    """Base shop item model"""
    name: str
    category: str
    price: int
    is_active: bool = True
    inventory_qty: Optional[int] = None


class ShopItemCreate(ShopItemBase):
    """Shop item creation model"""
    pass


class ShopItemUpdate(BaseModel):
    """Shop item update model"""
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[int] = None
    is_active: Optional[bool] = None
    inventory_qty: Optional[int] = None


class ShopItem(ShopItemBase, BaseResponse):
    """Shop item response model"""
    id: UUIDField


# Redemption models
class RedemptionBase(BaseModel):
    """Base redemption model"""
    account_id: UUIDField
    item_id: UUIDField
    qty: int = 1


class RedemptionCreate(RedemptionBase):
    """Redemption creation model"""
    pass


class RedemptionUpdate(BaseModel):
    """Redemption update model (admin only)"""
    status: RedemptionStatus
    notes: Optional[str] = None


class Redemption(RedemptionBase, BaseResponse):
    """Redemption response model"""
    id: UUIDField
    status: RedemptionStatus
    requested_at: TimestampField
    fulfilled_at: Optional[TimestampField] = None
    notes: Optional[str] = None


class RedemptionWithItem(Redemption):
    """Redemption with shop item details"""
    item_name: str
    item_category: str
    total_cost: int


# Leaderboard models
class LeaderboardEntry(BaseResponse):
    """Leaderboard entry model"""
    period_start: datetime
    period_end: datetime
    class_id: UUIDField
    child_id: UUIDField
    rank: int
    percentile: float


class WeeklyLeaderboard(BaseResponse):
    """Weekly leaderboard response"""
    period_start: datetime
    period_end: datetime
    class_id: UUIDField
    entries: List[LeaderboardEntry]


# Request models
class RedeemTokensRequest(BaseModel):
    """Token redemption request"""
    child_id: UUIDField
    item_id: UUIDField
    qty: int = Field(default=1, ge=1)


class TokenHistoryRequest(BaseModel):
    """Token history request parameters"""
    child_id: UUIDField
    limit: int = Field(default=20, ge=1, le=100)
    cursor: Optional[str] = None


class TokenHistoryResponse(BaseResponse):
    """Token history response"""
    transactions: List[TokenTransactionWithDetails]
    next_cursor: Optional[str] = None
    has_more: bool = False


# Award tokens models
class AwardTokensRequest(BaseModel):
    """Award tokens request (internal/admin)"""
    child_id: UUIDField
    amount: int
    reason: ReasonType
    ref_table: Optional[str] = None
    ref_id: Optional[UUIDField] = None
    description: Optional[str] = None 