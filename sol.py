class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        prev = head
        curr = head.next
        after = head.next.next

        head.next = None

        while after.next is not None:
            curr.next = prev
            prev = curr
            curr = after
            after = after.next

        curr.next = prev
        after.next = curr
        return after

# Create a test linked list: 1 -> 2 -> 3
linkd = ListNode(1)
linkd.next = ListNode(2)
linkd.next.next = ListNode(3)

# Test
sol = Solution()
reversed_head = sol.reverseList(linkd)

# Print reversed list
while reversed_head:
    print(reversed_head.val, end=" -> " if reversed_head.next else "\n")
    reversed_head = reversed_head.next
