
-- 1. Admin UPDATE policy for seller_verifications
CREATE POLICY "Admins can update verifications"
ON public.seller_verifications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Message read marking UPDATE policy (recipients can mark as read)
CREATE POLICY "Recipients can mark messages read"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- 3. Properties DELETE policy (owners can delete own properties)
CREATE POLICY "Users can delete own properties"
ON public.properties
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
