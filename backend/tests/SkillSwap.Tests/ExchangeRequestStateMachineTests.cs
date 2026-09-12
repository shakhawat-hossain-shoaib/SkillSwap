using System;
using SkillSwap.Api.Models;
using SkillSwap.Api.Models.Enums;
using Xunit;

namespace SkillSwap.Tests;

public class ExchangeRequestStateMachineTests
{
    private ExchangeRequest CreatePendingRequest(int senderId = 1, int receiverId = 2)
    {
        return new ExchangeRequest
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Status = ExchangeRequestStatus.Pending
        };
    }

    [Fact]
    public void TransitionTo_ReceiverAcceptsPendingRequest_StatusIsAccepted()
    {
        // Arrange
        var request = CreatePendingRequest();

        // Act
        request.TransitionTo(ExchangeRequestStatus.Accepted, request.ReceiverId);

        // Assert
        Assert.Equal(ExchangeRequestStatus.Accepted, request.Status);
    }

    [Fact]
    public void TransitionTo_SenderTriesToAcceptPendingRequest_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = CreatePendingRequest();

        // Act & Assert
        Assert.Throws<UnauthorizedAccessException>(() => 
            request.TransitionTo(ExchangeRequestStatus.Accepted, request.SenderId));
    }

    [Fact]
    public void TransitionTo_ReceiverDeclinesPendingRequest_StatusIsDeclined()
    {
        // Arrange
        var request = CreatePendingRequest();

        // Act
        request.TransitionTo(ExchangeRequestStatus.Declined, request.ReceiverId);

        // Assert
        Assert.Equal(ExchangeRequestStatus.Declined, request.Status);
    }

    [Fact]
    public void TransitionTo_SenderCancelsPendingRequest_StatusIsCancelled()
    {
        // Arrange
        var request = CreatePendingRequest();

        // Act
        request.TransitionTo(ExchangeRequestStatus.Cancelled, request.SenderId);

        // Assert
        Assert.Equal(ExchangeRequestStatus.Cancelled, request.Status);
    }

    [Fact]
    public void TransitionTo_ReceiverTriesToCancelPendingRequest_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = CreatePendingRequest();

        // Act & Assert
        Assert.Throws<UnauthorizedAccessException>(() => 
            request.TransitionTo(ExchangeRequestStatus.Cancelled, request.ReceiverId));
    }

    [Fact]
    public void TransitionTo_AcceptedRequestTransitionsToInProgress_Success()
    {
        // Arrange
        var request = CreatePendingRequest();
        request.Status = ExchangeRequestStatus.Accepted;

        // Act
        request.TransitionTo(ExchangeRequestStatus.InProgress, request.SenderId); // Any party can transition to InProgress

        // Assert
        Assert.Equal(ExchangeRequestStatus.InProgress, request.Status);
    }

    [Fact]
    public void TransitionTo_InProgressRequestTransitionsToCompleted_Success()
    {
        // Arrange
        var request = CreatePendingRequest();
        request.Status = ExchangeRequestStatus.InProgress;

        // Act
        request.TransitionTo(ExchangeRequestStatus.Completed, request.ReceiverId);

        // Assert
        Assert.Equal(ExchangeRequestStatus.Completed, request.Status);
    }

    [Fact]
    public void TransitionTo_PendingRequestTransitionsDirectlyToCompleted_ThrowsInvalidOperationException()
    {
        // Arrange
        var request = CreatePendingRequest();

        // Act & Assert
        var ex = Assert.Throws<InvalidOperationException>(() => 
            request.TransitionTo(ExchangeRequestStatus.Completed, request.ReceiverId));
        
        Assert.Contains("Cannot transition from Pending to Completed", ex.Message);
    }

    [Fact]
    public void TransitionTo_ThirdPartyTriesToModify_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = CreatePendingRequest();
        var thirdPartyId = 999;

        // Act & Assert
        Assert.Throws<UnauthorizedAccessException>(() => 
            request.TransitionTo(ExchangeRequestStatus.Accepted, thirdPartyId));
    }
}
